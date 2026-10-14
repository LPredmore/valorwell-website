// Turns the "ValorWell Website Resources (Master)" Google Sheet into an import
// payload for public.import_website_resources, and checks every row against
// the sheet's Content Spec before anything is written.
//
// Pure TypeScript with erasable types only, so the same file runs in the
// Supabase Edge Function (Deno), in Node (`--experimental-strip-types`) for
// the CLI, and in Vitest.

export type SheetTable = string[][];

export type SheetTables = {
  pages: SheetTable;
  categories: SheetTable;
  groups: SheetTable;
};

export type Cta = "find_care" | "join_network" | "support_foundation";

export type ImportSource = {
  title: string;
  url: string;
  organization: string | null;
  source_type: "official" | "statute" | "regulation" | "policy" | "clinical" | "research" | "other";
};

export type ImportArticle = {
  category_slug: string;
  slug: string;
  title: string;
  primary_question: string;
  summary: string;
  quick_answer: string;
  body_markdown: string;
  in_practice_markdown: string | null;
  faq: { question: string; answer: string }[];
  audience_tags: string[];
  topic_aliases: string[];
  cta: Cta;
  group_slug: string;
  sort_order: number;
  reviewed_by: string;
  last_reviewed_on: string | null;
  sources: ImportSource[];
  content_hash: string;
};

export type ImportCategory = {
  slug: string;
  title: string;
  summary: string;
  primary_question: string;
  body_markdown: string;
  sort_order: number;
  status: "published" | "archived";
};

export type ImportGroup = {
  category_slug: string;
  group_slug: string;
  name: string;
  display_order: number;
  intro: string | null;
};

export type ImportPayload = {
  categories?: ImportCategory[];
  groups?: ImportGroup[];
  articles?: ImportArticle[];
  relations?: { from: string; to: string[] }[];
  archive?: { category_slug: string; slug: string }[];
  redirects?: { from_path: string; to_path: string; reason: string }[];
};

export type RowProblem = {
  row: number;
  key: string;
  problems: string[];
};

export type BuildResult = {
  payload: ImportPayload;
  errors: RowProblem[];
  warnings: RowProblem[];
  summary: {
    articles: number;
    categoriesPublished: number;
    categoriesArchived: number;
    groups: number;
    retired: number;
    skippedNotReady: number;
    skippedWithErrors: number;
  };
};

// ---------------------------------------------------------------------------
// CSV

/** RFC 4180 CSV parser (quoted fields, doubled quotes, newlines in quotes). */
export function parseCsv(text: string): SheetTable {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (quoted) throw new Error("CSV ends inside a quoted field.");
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function records(table: SheetTable): { row: number; get: (column: string) => string }[] {
  if (table.length === 0) return [];
  const header = table[0].map((name) => name.trim());
  const index = new Map(header.map((name, i) => [name, i]));
  return table.slice(1).map((cells, i) => ({
    row: i + 2,
    get: (column: string) => {
      const at = index.get(column);
      if (at === undefined) throw new Error(`Sheet is missing the "${column}" column.`);
      return (cells[at] ?? "").replace(/\r\n/g, "\n").trim();
    },
  }));
}

function requireColumns(table: SheetTable, tab: string, columns: string[]) {
  const header = new Set((table[0] ?? []).map((name) => name.trim()));
  const missing = columns.filter((column) => !header.has(column));
  if (missing.length > 0) {
    throw new Error(`${tab} tab is missing column(s): ${missing.join(", ")}`);
  }
}

// ---------------------------------------------------------------------------
// Rules from the Content Spec tab

const ALLOWED_DOMAINS = [
  "va.gov",
  "ecfr.gov",
  "uscode.house.gov",
  "federalregister.gov",
  "tricare.mil",
  "dmdc.osd.mil",
  "medicare.gov",
  "ssa.gov",
  "healthcare.gov",
  "irs.gov",
  "valorwell.org",
  "cms.gov",
  "govinfo.gov",
  "congress.gov",
  "veteranscrisisline.net",
];

const THERAPIST_EXTRA_DOMAINS = [
  "dol.gov",
  "ftc.gov",
  "hhs.gov",
  "psychologytoday.com",
  "counselingcompact.org",
  "psypact.org",
  "swcompact.org",
];

const BLOCKED_DOMAINS = ["veteransbenefitskb.com"];

const FORBIDDEN_HEADINGS = /^##\s+(sources|faq|frequently asked|last (reviewed|updated)|reviewed by)\b/im;

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const AUDIENCE_TAGS: Record<string, string[]> = {
  beneficiary: ["beneficiary"],
  veteran: ["veteran"],
  provider: ["provider"],
  family: ["family"],
  both: ["beneficiary", "provider"],
};

const CTAS: Cta[] = ["find_care", "join_network", "support_foundation"];

const PUBLISHABLE_BUILD_STATUSES = new Set(["drafted", "published"]);

function domainAllowed(host: string, category: string): boolean {
  const matches = (domain: string) => host === domain || host.endsWith(`.${domain}`);
  if (BLOCKED_DOMAINS.some(matches)) return false;
  if (ALLOWED_DOMAINS.some(matches)) return true;
  if (category === "for-therapists") {
    if (THERAPIST_EXTRA_DOMAINS.some(matches)) return true;
    if (host.endsWith(".gov")) return true; // state licensing boards
  }
  return false;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseFaq(value: string): { pairs: { question: string; answer: string }[]; malformed: boolean } {
  const pairs: { question: string; answer: string }[] = [];
  let malformed = false;
  const blocks = value.trim() ? value.trim().split(/\n\s*\n/) : [];
  for (const block of blocks) {
    const match = block.trim().match(/^Q:\s*([\s\S]+?)\nA:\s*([\s\S]+)$/);
    if (!match || !match[1].trim() || !match[2].trim()) {
      malformed = true;
      continue;
    }
    pairs.push({ question: match[1].trim(), answer: match[2].trim() });
  }
  return { pairs, malformed };
}

function sourceType(url: string): ImportSource["source_type"] {
  const host = hostOf(url) ?? "";
  if (host.endsWith("ecfr.gov") || host.endsWith("federalregister.gov")) return "regulation";
  if (host.endsWith("uscode.house.gov") || host.endsWith("govinfo.gov") || host.endsWith("congress.gov")) {
    return "statute";
  }
  if (host.endsWith("psychologytoday.com")) return "other";
  return "official";
}

export function parseSources(value: string): { sources: ImportSource[]; problems: string[] } {
  const sources: ImportSource[] = [];
  const problems: string[] = [];
  for (const line of lines(value)) {
    const split = line.lastIndexOf(" | ");
    const title = split > 0 ? line.slice(0, split).trim() : "";
    const url = split > 0 ? line.slice(split + 3).trim() : "";
    if (!title || !/^https?:\/\//.test(url) || !hostOf(url)) {
      problems.push(`source line is not "Title | https://url": ${line.slice(0, 80)}`);
      continue;
    }
    const colon = title.indexOf(":");
    sources.push({
      title,
      url,
      organization: colon > 0 && colon < 40 ? title.slice(0, colon).trim() : null,
      source_type: sourceType(url),
    });
  }
  return { sources, problems };
}

/** Stable 64-bit hex hash (two FNV-1a passes); used only to detect changed rows. */
export function contentHash(value: unknown): string {
  const text = stableJson(value);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193 ^ text.length;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ code, 0x5bd1e995) >>> 0;
    h2 ^= h2 >>> 13;
  }
  return `${h1.toString(16).padStart(8, "0")}${(h2 >>> 0).toString(16).padStart(8, "0")}`;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function toInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// ---------------------------------------------------------------------------
// Build

type PageRow = {
  row: number;
  key: string;
  category: string;
  slug: string;
  status: string;
  buildStatus: string;
  get: (column: string) => string;
};

export type BuildOptions = {
  /**
   * category/slug keys already live on the site that are not in the sheet.
   * Related links and redirects may point at them.
   */
  extraLiveKeys?: string[];
};

export function buildImport(tables: SheetTables, options: BuildOptions = {}): BuildResult {
  requireColumns(tables.pages, "Pages", [
    "slug", "category", "group", "sort_order", "status", "main_question", "audience", "cta",
    "reviewed_by", "last_reviewed", "title", "summary", "quick_answer", "body_markdown",
    "in_practice", "in_practice_notes", "faq", "sources", "related_slugs", "search_phrases",
    "redirect_to", "build_status",
  ]);
  requireColumns(tables.categories, "Categories", ["category", "name", "display_order", "current_hub_title", "hub_intro"]);
  requireColumns(tables.groups, "Groups", ["category", "group", "group_anchor", "group_order"]);

  const errors: RowProblem[] = [];
  const warnings: RowProblem[] = [];

  // Groups ------------------------------------------------------------------
  const groupByName = new Map<string, ImportGroup>();
  const groups: ImportGroup[] = [];
  for (const record of records(tables.groups)) {
    const category = record.get("category");
    const name = record.get("group");
    if (!category && !name) continue;
    const group: ImportGroup = {
      category_slug: category,
      group_slug: record.get("group_anchor"),
      name,
      display_order: toInt(record.get("group_order"), 100),
      intro: tables.groups[0].includes("hub_intro") ? record.get("hub_intro") || null : null,
    };
    const problems: string[] = [];
    if (!SLUG.test(group.category_slug)) problems.push("category is not a valid slug");
    if (!SLUG.test(group.group_slug)) problems.push("group_anchor is not a valid slug");
    if (!group.name) problems.push("group name is blank");
    if (problems.length > 0) {
      errors.push({ row: record.row, key: `Groups:${category}/${name}`, problems });
      continue;
    }
    groupByName.set(`${category}\u0000${name}`, group);
    groups.push(group);
  }

  // Pages -------------------------------------------------------------------
  const pages: PageRow[] = records(tables.pages)
    .filter((record) => record.get("slug") || record.get("category"))
    .map((record) => ({
      row: record.row,
      key: `${record.get("category")}/${record.get("slug")}`,
      category: record.get("category"),
      slug: record.get("slug"),
      status: record.get("status").toLowerCase(),
      buildStatus: record.get("build_status").toLowerCase(),
      get: record.get,
    }));

  const seen = new Map<string, number>();
  for (const page of pages) {
    if (seen.has(page.key)) {
      errors.push({ row: page.row, key: page.key, problems: [`duplicate of row ${seen.get(page.key)}`] });
    } else {
      seen.set(page.key, page.row);
    }
  }

  const candidates = pages.filter(
    (page) =>
      page.status !== "retired" &&
      page.get("title") !== "" &&
      PUBLISHABLE_BUILD_STATUSES.has(page.buildStatus) &&
      seen.get(page.key) === page.row,
  );
  const retired = pages.filter((page) => page.status === "retired" && seen.get(page.key) === page.row);
  const skippedNotReady = pages.filter(
    (page) => page.status !== "retired" && !candidates.includes(page),
  ).length;

  // Pages that will be live after this import, before link checks prune any.
  const willBeLive = new Set<string>([...candidates.map((page) => page.key), ...(options.extraLiveKeys ?? [])]);

  const articles: ImportArticle[] = [];
  const relations: { from: string; to: string[] }[] = [];
  const rejected = new Set<string>();

  for (const page of candidates) {
    const problems: string[] = [];
    const notes: string[] = [];
    const get = page.get;
    const category = page.category;

    if (!SLUG.test(page.slug)) problems.push("slug must be lowercase words joined by hyphens");
    if (!SLUG.test(category)) problems.push("category must be lowercase words joined by hyphens");

    const groupName = get("group");
    const group = groupByName.get(`${category}\u0000${groupName}`);
    if (!group) problems.push(`group "${groupName}" is not on the Groups tab for ${category}`);

    const title = get("title");
    const summary = get("summary");
    const quickAnswer = get("quick_answer");
    const body = get("body_markdown");
    if (title.length < 30 || title.length > 80) problems.push(`title is ${title.length} characters (30-80)`);
    if (summary.length < 90 || summary.length > 175) problems.push(`summary is ${summary.length} characters (90-175)`);
    if (!quickAnswer) problems.push("quick_answer is blank");
    else if (quickAnswer.split(/\s+/).length > 70) problems.push("quick_answer is over 70 words");
    if (/\]\(/.test(quickAnswer)) problems.push("quick_answer contains a link");
    if (!body.startsWith("## ")) problems.push("body_markdown must start with a ## section");
    if (/^# /m.test(body)) problems.push("body_markdown has an H1 (# ) heading");
    if (FORBIDDEN_HEADINGS.test(body)) problems.push("body_markdown has a Sources/FAQ/Reviewed/Updated heading");

    const faq = parseFaq(get("faq"));
    if (faq.malformed) problems.push("faq has a block that is not a Q:/A: pair");
    if (faq.pairs.length < 3 || faq.pairs.length > 7) problems.push(`faq has ${faq.pairs.length} pairs (expected 4-6)`);
    else if (faq.pairs.length < 4 || faq.pairs.length > 6) notes.push(`faq has ${faq.pairs.length} pairs (spec says 4-6)`);

    const sources = parseSources(get("sources"));
    problems.push(...sources.problems);
    if (sources.sources.length === 0) problems.push("sources is blank");

    const related = lines(get("related_slugs"));
    if (related.length < 3 || related.length > 4) problems.push(`related_slugs has ${related.length} entries (3-4)`);
    for (const target of related) {
      if (target === page.key) problems.push("related_slugs lists the page itself");
      else if (!willBeLive.has(target)) problems.push(`related page ${target} is not live`);
    }

    const inPractice = get("in_practice");
    if (inPractice && !get("in_practice_notes")) problems.push("in_practice is filled but in_practice_notes is blank");

    const linkText = [title, summary, quickAnswer, body, inPractice, get("faq"), get("sources")].join("\n");
    for (const url of linkText.match(/https?:\/\/[^\s)\]|>"]+/g) ?? []) {
      const host = hostOf(url);
      if (!host) problems.push(`malformed link ${url}`);
      else if (!domainAllowed(host, category)) problems.push(`link to a domain that isn't allowed: ${host}`);
    }
    for (const match of linkText.matchAll(/\]\(\/resources\/([^)#\s?]+)/g)) {
      const target = match[1].replace(/\/$/, "");
      if (!willBeLive.has(target)) problems.push(`internal link to /resources/${target}, which is not live`);
    }

    const cta = get("cta") as Cta;
    if (!CTAS.includes(cta)) problems.push(`cta "${get("cta")}" is not one of ${CTAS.join(", ")}`);

    const audienceTags = AUDIENCE_TAGS[get("audience").toLowerCase()];
    if (!audienceTags) problems.push(`audience "${get("audience")}" is not Beneficiary, Veteran, Provider, Both, or Family`);

    const lastReviewed = get("last_reviewed");
    if (lastReviewed && !/^\d{4}-\d{2}-\d{2}$/.test(lastReviewed)) problems.push("last_reviewed must be YYYY-MM-DD");

    if (notes.length > 0) warnings.push({ row: page.row, key: page.key, problems: notes });
    if (problems.length > 0) {
      errors.push({ row: page.row, key: page.key, problems });
      rejected.add(page.key);
      continue;
    }

    const content = {
      title,
      primary_question: get("main_question") || title,
      summary,
      quick_answer: quickAnswer,
      body_markdown: body,
      in_practice_markdown: inPractice || null,
      faq: faq.pairs,
      audience_tags: audienceTags,
      topic_aliases: lines(get("search_phrases")),
      cta,
      group_slug: group.group_slug,
      sort_order: toInt(get("sort_order"), 100),
      reviewed_by: get("reviewed_by") || "ValorWell",
      last_reviewed_on: lastReviewed || null,
      sources: sources.sources,
    };

    articles.push({
      category_slug: category,
      slug: page.slug,
      ...content,
      content_hash: contentHash(content),
    });
    relations.push({ from: page.key, to: related });
  }

  // A rejected page can't be linked to. Drop links to it rather than failing
  // the pages that point at it, and say so.
  if (rejected.size > 0) {
    for (const relation of relations) {
      const dropped = relation.to.filter((target) => rejected.has(target));
      if (dropped.length > 0) {
        relation.to = relation.to.filter((target) => !rejected.has(target));
        const page = pages.find((candidate) => candidate.key === relation.from);
        warnings.push({
          row: page?.row ?? 0,
          key: relation.from,
          problems: dropped.map((target) => `related link to ${target} dropped because that row has errors`),
        });
      }
    }
  }

  const liveAfter = new Set<string>([...articles.map((a) => `${a.category_slug}/${a.slug}`), ...(options.extraLiveKeys ?? [])]);

  // Retired pages -------------------------------------------------------------
  const archive: { category_slug: string; slug: string }[] = [];
  const redirects: { from_path: string; to_path: string; reason: string }[] = [];
  for (const page of retired) {
    const target = page.get("redirect_to").replace(/^\/?resources\//, "").replace(/^\/|\/$/g, "");
    const problems: string[] = [];
    if (!target) problems.push("retired row has no redirect_to");
    else if (!liveAfter.has(target)) problems.push(`redirect_to ${target} is not a live page`);
    if (problems.length > 0) {
      errors.push({ row: page.row, key: page.key, problems });
      continue;
    }
    archive.push({ category_slug: page.category, slug: page.slug });
    redirects.push({
      from_path: `/resources/${page.key}`,
      to_path: `/resources/${target}`,
      reason: "Retired in the resources sheet",
    });
  }

  // Categories ------------------------------------------------------------------
  const articleCount = new Map<string, number>();
  for (const article of articles) {
    articleCount.set(article.category_slug, (articleCount.get(article.category_slug) ?? 0) + 1);
  }
  const extraByCategory = new Map<string, number>();
  for (const key of options.extraLiveKeys ?? []) {
    const category = key.split("/")[0];
    extraByCategory.set(category, (extraByCategory.get(category) ?? 0) + 1);
  }

  const categories: ImportCategory[] = [];
  for (const record of records(tables.categories)) {
    const slug = record.get("category");
    if (!slug) continue;
    const name = record.get("name");
    const intro = record.get("hub_intro");
    if (!SLUG.test(slug) || !name) {
      errors.push({ row: record.row, key: `Categories:${slug}`, problems: ["category slug or name is invalid"] });
      continue;
    }
    const live = (articleCount.get(slug) ?? 0) + (extraByCategory.get(slug) ?? 0) > 0;
    categories.push({
      slug,
      title: record.get("current_hub_title") || `${name} Resources`,
      summary: intro,
      primary_question: `What does ValorWell have on ${name}?`,
      body_markdown: intro || `Answers to common questions about ${name}.`,
      sort_order: toInt(record.get("display_order"), 100),
      status: live ? "published" : "archived",
    });
    if (!live) {
      redirects.push({ from_path: `/resources/${slug}`, to_path: "/resources", reason: "Topic has no live pages" });
    }
  }

  const categorySlugs = new Set(categories.filter((c) => c.status === "published").map((c) => c.slug));
  for (const article of [...articles]) {
    if (!categorySlugs.has(article.category_slug)) {
      errors.push({
        row: seen.get(`${article.category_slug}/${article.slug}`) ?? 0,
        key: `${article.category_slug}/${article.slug}`,
        problems: [`category ${article.category_slug} is not on the Categories tab`],
      });
      articles.splice(articles.indexOf(article), 1);
    }
  }
  for (const group of groups) {
    if (!categories.some((c) => c.slug === group.category_slug)) {
      warnings.push({ row: 0, key: `Groups:${group.category_slug}/${group.name}`, problems: ["group's category is not on the Categories tab"] });
    }
  }

  return {
    payload: {
      categories,
      groups: groups.filter((g) => categories.some((c) => c.slug === g.category_slug)),
      articles,
      relations,
      archive,
      redirects,
    },
    errors,
    warnings,
    summary: {
      articles: articles.length,
      categoriesPublished: categories.filter((c) => c.status === "published").length,
      categoriesArchived: categories.filter((c) => c.status === "archived").length,
      groups: groups.length,
      retired: archive.length,
      skippedNotReady,
      skippedWithErrors: rejected.size,
    },
  };
}

/**
 * Splits a payload into batches small enough for one database call each:
 * live categories and groups first, then articles, then everything that
 * depends on all articles existing (related links, retirements, redirects,
 * and topics being archived). Only use batches for real imports: a dry run
 * has to be one call, because each dry-run call is rolled back.
 */
export function splitPayload(payload: ImportPayload, articlesPerBatch = 25): ImportPayload[] {
  const articles = payload.articles ?? [];
  const live = (payload.categories ?? []).filter((c) => c.status === "published");
  const archived = (payload.categories ?? []).filter((c) => c.status === "archived");
  const batches: ImportPayload[] = [];
  for (let i = 0; i < Math.max(articles.length, 1); i += articlesPerBatch) {
    batches.push({ articles: articles.slice(i, i + articlesPerBatch) });
  }
  batches[0] = { categories: live, groups: payload.groups ?? [], ...batches[0] };
  batches.push({
    relations: payload.relations ?? [],
    archive: payload.archive ?? [],
    redirects: payload.redirects ?? [],
    categories: archived,
  });
  return batches;
}
