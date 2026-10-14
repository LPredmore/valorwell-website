import { describe, expect, it } from "vitest";
import {
  buildImport,
  contentHash,
  parseCsv,
  parseFaq,
  parseSources,
  splitPayload,
  type SheetTables,
} from "../../supabase/functions/_shared/resourceSheet";

const PAGE_HEADER = [
  "slug", "category", "url", "group", "group_order", "sort_order", "status", "main_question",
  "current_title", "scope_notes", "audience", "cta", "inventory_ids", "cfr_authority",
  "official_sources", "update_risk", "reviewed_by", "last_reviewed", "last_updated",
  "in_practice_notes", "title", "summary", "quick_answer", "body_markdown", "in_practice", "faq",
  "sources", "related_slugs", "search_phrases", "redirect_to", "build_status",
];

const FAQ = [
  "Q: First question?\nA: First answer.",
  "Q: Second question?\nA: Second answer.",
  "Q: Third question?\nA: Third answer.",
  "Q: Fourth question?\nA: Fourth answer.",
].join("\n\n");

type PageOverrides = Partial<Record<(typeof PAGE_HEADER)[number], string>>;

function page(slug: string, overrides: PageOverrides = {}): string[] {
  const values: Record<string, string> = {
    slug,
    category: "champva",
    group: "Start Here",
    sort_order: "1",
    status: "published",
    main_question: `What is ${slug}?`,
    audience: "Beneficiary",
    cta: "find_care",
    reviewed_by: "ValorWell",
    title: `A Title About ${slug} That Is Long Enough`,
    summary:
      "A summary that is long enough to pass the length check for search results and states the answer plainly for readers.",
    quick_answer: "Yes. This is the short answer.",
    body_markdown: "## Is this a section?\n\nYes, with a [VA link](https://www.va.gov/champva/).",
    faq: FAQ,
    sources: "VA: CHAMPVA | https://www.va.gov/champva/\n38 CFR 17.271 | https://www.ecfr.gov/current/title-38/section-17.271",
    related_slugs: "champva/alpha\nchampva/beta\nchampva/gamma",
    search_phrases: "one\ntwo\nthree",
    build_status: "drafted",
    ...overrides,
  };
  return PAGE_HEADER.map((column) => values[column] ?? "");
}

function tables(pages: string[][]): SheetTables {
  return {
    pages: [PAGE_HEADER, ...pages],
    categories: [
      ["category", "name", "hub_url", "display_order", "current_hub_title", "hub_intro", "page_count"],
      ["champva", "CHAMPVA", "", "1", "CHAMPVA Resources", "", ""],
      ["family-systems", "Family Systems", "", "5", "Family Systems Resources", "", ""],
    ],
    groups: [
      ["category", "group", "group_anchor", "group_order", "page_count", "hub_intro"],
      ["champva", "Start Here", "start-here", "1", "", ""],
    ],
  };
}

const related = (key: string) => ({ related_slugs: ["alpha", "beta", "gamma", "delta"].filter((s) => `champva/${s}` !== key).slice(0, 3).map((s) => `champva/${s}`).join("\n") });

function fourPages(extra: PageOverrides = {}) {
  return ["alpha", "beta", "gamma", "delta"].map((slug) => page(slug, { ...related(`champva/${slug}`), ...extra }));
}

describe("parseCsv", () => {
  it("handles quotes, doubled quotes, commas and newlines inside fields", () => {
    const rows = parseCsv('a,b\r\n"x, y","line 1\nline ""2"""\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["x, y", 'line 1\nline "2"'],
    ]);
  });

  it("rejects an unterminated quote", () => {
    expect(() => parseCsv('a,"b')).toThrow(/quoted field/);
  });
});

describe("parseFaq and parseSources", () => {
  it("reads Q/A pairs and flags malformed blocks", () => {
    expect(parseFaq(FAQ).pairs).toHaveLength(4);
    expect(parseFaq("Q: only a question").malformed).toBe(true);
  });

  it("reads sources and classifies them", () => {
    const { sources, problems } = parseSources(
      "VA: CHAMPVA | https://www.va.gov/champva/\n38 U.S.C. 1781 | https://uscode.house.gov/view.xhtml\nnot a source",
    );
    expect(problems).toHaveLength(1);
    expect(sources[0]).toMatchObject({ organization: "VA", source_type: "official" });
    expect(sources[1].source_type).toBe("statute");
  });
});

describe("buildImport", () => {
  it("builds articles, groups, relations and archives empty topics", () => {
    const result = buildImport(tables(fourPages()));
    expect(result.errors).toEqual([]);
    expect(result.payload.articles).toHaveLength(4);
    const article = result.payload.articles![0];
    expect(article).toMatchObject({
      category_slug: "champva",
      slug: "alpha",
      group_slug: "start-here",
      audience_tags: ["beneficiary"],
      topic_aliases: ["one", "two", "three"],
      reviewed_by: "ValorWell",
      last_reviewed_on: null,
    });
    expect(article.faq[0]).toEqual({ question: "First question?", answer: "First answer." });
    expect(result.payload.relations![0]).toEqual({ from: "champva/alpha", to: ["champva/beta", "champva/gamma", "champva/delta"] });
    expect(result.payload.categories).toEqual([
      expect.objectContaining({ slug: "champva", status: "published" }),
      expect.objectContaining({ slug: "family-systems", status: "archived" }),
    ]);
    expect(result.payload.redirects).toContainEqual({
      from_path: "/resources/family-systems",
      to_path: "/resources",
      reason: "Topic has no live pages",
    });
  });

  it("turns retired rows into an archive entry and a redirect", () => {
    const rows = [...fourPages(), page("old-page", { status: "retired", title: "", redirect_to: "champva/alpha", build_status: "published" })];
    const result = buildImport(tables(rows));
    expect(result.payload.archive).toEqual([{ category_slug: "champva", slug: "old-page" }]);
    expect(result.payload.redirects).toContainEqual({
      from_path: "/resources/champva/old-page",
      to_path: "/resources/champva/alpha",
      reason: "Retired in the resources sheet",
    });
  });

  it("rejects a retired row whose redirect target isn't live", () => {
    const rows = [...fourPages(), page("old-page", { status: "retired", title: "", redirect_to: "champva/missing" })];
    const result = buildImport(tables(rows));
    expect(result.errors).toContainEqual(
      expect.objectContaining({ key: "champva/old-page", problems: ["redirect_to champva/missing is not a live page"] }),
    );
  });

  it("skips rows that are not ready", () => {
    const rows = [...fourPages(), page("later", { build_status: "needs_content" }), page("blank", { title: "" })];
    const result = buildImport(tables(rows));
    expect(result.summary.skippedNotReady).toBe(2);
    expect(result.payload.articles).toHaveLength(4);
  });

  it("rejects disallowed links, including the knowledge base site", () => {
    const rows = fourPages();
    rows[0] = page("alpha", {
      ...related("champva/alpha"),
      body_markdown: "## Section\n\nSee [this](https://veteransbenefitskb.com/x) and [that](https://example.com).",
    });
    const result = buildImport(tables(rows));
    const problems = result.errors.find((e) => e.key === "champva/alpha")?.problems ?? [];
    expect(problems).toContain("link to a domain that isn't allowed: veteransbenefitskb.com");
    expect(problems).toContain("link to a domain that isn't allowed: example.com");
    expect(result.payload.articles!.map((a) => a.slug)).not.toContain("alpha");
  });

  it("allows state board .gov links only on therapist pages", () => {
    const header = tables([]).groups;
    const t = tables([
      page("t1", {
        category: "for-therapists",
        cta: "join_network",
        audience: "Provider",
        body_markdown: "## Section\n\nThe [Texas board](https://www.bhec.texas.gov/).",
        related_slugs: "champva/alpha\nchampva/beta\nchampva/gamma",
      }),
      ...fourPages(),
    ]);
    t.categories.push(["for-therapists", "For Therapists", "", "7", "Resources for Therapists", "Intro.", ""]);
    t.groups = [...header, ["for-therapists", "Start Here", "start-here", "1", "", ""]];
    const result = buildImport(t);
    expect(result.errors).toEqual([]);
    expect(result.payload.articles!.find((a) => a.slug === "t1")?.cta).toBe("join_network");
  });

  it("rejects internal links and related pages that won't be live", () => {
    const rows = fourPages();
    rows[0] = page("alpha", {
      related_slugs: "champva/beta\nchampva/gamma\nchampva/nowhere",
      body_markdown: "## Section\n\nSee [missing](/resources/champva/not-a-page).",
    });
    const result = buildImport(tables(rows));
    const problems = result.errors.find((e) => e.key === "champva/alpha")?.problems ?? [];
    expect(problems).toContain("related page champva/nowhere is not live");
    expect(problems).toContain("internal link to /resources/champva/not-a-page, which is not live");
    // Pages that pointed at the rejected row keep their other links.
    expect(result.payload.relations!.find((r) => r.from === "champva/beta")?.to).not.toContain("champva/alpha");
    expect(result.warnings.some((w) => w.key === "champva/beta")).toBe(true);
  });

  it("catches structural problems", () => {
    const rows = fourPages();
    rows[0] = page("alpha", {
      ...related("champva/alpha"),
      title: "Too short",
      quick_answer: "",
      body_markdown: "# H1\n\n## Sources\n",
      faq: "Q: one?\nA: one.",
      cta: "donate",
      group: "Nope",
      last_reviewed: "Oct 14",
    });
    const problems = buildImport(tables(rows)).errors[0].problems.join(" | ");
    for (const expected of [
      "title is 9 characters",
      "quick_answer is blank",
      "must start with a ## section",
      "has an H1",
      "Sources/FAQ/Reviewed/Updated heading",
      "faq has 1 pairs",
      'cta "donate"',
      'group "Nope"',
      "last_reviewed must be YYYY-MM-DD",
    ]) {
      expect(problems).toContain(expected);
    }
  });

  it("flags duplicate rows", () => {
    const rows = [...fourPages(), page("alpha", related("champva/alpha"))];
    expect(buildImport(tables(rows)).errors).toContainEqual(
      expect.objectContaining({ key: "champva/alpha", problems: ["duplicate of row 2"] }),
    );
  });

  it("fails loudly when a sheet column is missing", () => {
    const t = tables(fourPages());
    t.pages[0] = t.pages[0].map((c) => (c === "quick_answer" ? "quick" : c));
    expect(() => buildImport(t)).toThrow(/quick_answer/);
  });
});

describe("contentHash", () => {
  it("is stable across key order and changes with content", () => {
    expect(contentHash({ a: 1, b: [1, 2] })).toBe(contentHash({ b: [1, 2], a: 1 }));
    expect(contentHash({ a: 1 })).not.toBe(contentHash({ a: 2 }));
    expect(contentHash({ a: 1 })).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe("splitPayload", () => {
  it("puts live topics first and dependent work last", () => {
    const { payload } = buildImport(tables(fourPages()));
    const batches = splitPayload(payload, 3);
    expect(batches).toHaveLength(3);
    expect(batches[0].categories!.map((c) => c.slug)).toEqual(["champva"]);
    expect(batches[0].articles).toHaveLength(3);
    expect(batches[1].articles).toHaveLength(1);
    const last = batches[2];
    expect(last.relations).toHaveLength(4);
    expect(last.categories!.map((c) => c.slug)).toEqual(["family-systems"]);
  });
});
