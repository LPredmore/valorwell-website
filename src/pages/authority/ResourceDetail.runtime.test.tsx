import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AppRoutes } from "@/AppRoutes";

type Row = {
  slug: string;
  title: string;
  primary_question: string;
  summary: string;
  body_markdown: string;
  faq: { question: string; answer: string }[];
  audience_tags: string[];
  topic_aliases: string[];
  source_urls: string[];
  coverage_status: string;
  status: string;
  live_url: string | null;
  last_researched_at: string | null;
  published_at: string | null;
  resource_kind: "category" | "article";
  category_slug: string | null;
};

const base = {
  primary_question: "",
  faq: [],
  audience_tags: [],
  topic_aliases: [],
  coverage_status: "complete",
  status: "published",
  live_url: null,
  published_at: null,
};

const rows: (Row & Record<string, unknown>)[] = [
  {
    ...base,
    slug: "for-therapists",
    title: "Resources for Therapists",
    summary: "Practical answers for licensed therapists.",
    body_markdown: "## Hub\n\nHub body.",
    source_urls: [],
    last_researched_at: null,
    resource_kind: "category",
    category_slug: null,
  },
  {
    ...base,
    id: "therapist-page",
    slug: "how-valorwell-works",
    title: "How ValorWell Works for Therapists",
    summary: "Clinical control stays with you.",
    quick_answer: "You make the clinical decisions and ValorWell handles billing.",
    in_practice_markdown: "We see **therapists** stay longer when admin work is handled.",
    body_markdown: "## What do you control?\n\nYour schedule. See [telehealth](/resources/for-therapists/telehealth-rules).",
    reviewed_by: "ValorWell",
    last_reviewed_on: "2026-10-14",
    public_updated_at: "2026-10-14T17:00:00Z",
    cta: "join_network",
    group_slug: "start-here",
    sort_order: 2,
    source_urls: [],
    last_researched_at: null,
    resource_kind: "article",
    category_slug: "for-therapists",
  },
  {
    ...base,
    id: "telehealth-page",
    slug: "telehealth-rules",
    title: "Telehealth Licensure Rules",
    summary: "Where the client sits matters.",
    body_markdown: "## Which license?\n\nThe client's state.",
    cta: "join_network",
    group_slug: "telehealth",
    sort_order: 1,
    source_urls: [],
    last_researched_at: null,
    resource_kind: "article",
    category_slug: "for-therapists",
  },
  {
    ...base,
    slug: "family-systems",
    title: "Family Systems Resources",
    summary: "Shared frameworks families can use repeatedly.",
    body_markdown: "## Category body\n\nCategory body text that must not appear as an article.",
    source_urls: [],
    last_researched_at: "2026-09-16T00:00:00Z",
    resource_kind: "category",
    category_slug: null,
  },
  {
    ...base,
    slug: "empty-topic",
    title: "Empty Topic",
    summary: "No articles yet.",
    body_markdown: "## Empty body\n\nShould not render as an article.",
    source_urls: [],
    last_researched_at: null,
    resource_kind: "category",
    category_slug: null,
  },
  {
    ...base,
    slug: "military-separation-limited-communication",
    title: "Coping With Limited or No Contact During a Military Separation",
    summary: "Practical ways military families can manage uncertainty.",
    body_markdown:
      "## The direct answer\n\nCommunication can be **limited** for *long stretches*.\n\n- First practical step\n\nA paragraph after the list.\n\n### Daily routines\n\nKeep predictable anchors.\n\n#### A smaller detail\n\nRead [helpful guidance](/resources).\n\n## What families can do\n\n1. Start here\n2. Continue there\n\n## Authoritative sources reviewed\n\n- https://www.va.gov/example-source\n\nLast researched and verified: September 16, 2026",
    source_urls: ["https://www.va.gov/example-source"],
    last_researched_at: "2026-09-16T00:00:00Z",
    resource_kind: "article",
    category_slug: "family-systems",
  },
  {
    ...base,
    slug: "a-future-article",
    title: "A Future Runtime Article",
    summary: "Published after the last deployment.",
    body_markdown: "## Overview\n\nRuntime content.",
    source_urls: [],
    last_researched_at: null,
    resource_kind: "article",
    category_slug: "family-systems",
  },
];

const extraRows: Record<string, Record<string, unknown>[]> = {
  website_resource_groups: [
    { category_slug: "for-therapists", group_slug: "start-here", name: "Start Here", display_order: 1, intro: "Read these first." },
    { category_slug: "for-therapists", group_slug: "telehealth", name: "Telehealth Practice", display_order: 2, intro: null },
  ],
  website_resource_sources: [
    { resource_id: "therapist-page", title: "VA: Community Care", url: "https://www.va.gov/communitycare/", organization: "VA", display_order: 1 },
  ],
  website_resource_relations: [
    { resource_id: "therapist-page", related_resource_id: "telehealth-page", relation_type: "related", display_order: 1 },
  ],
};

vi.mock("@/integrations/supabase/client", () => {
  type Data = Record<string, unknown>[];
  const builder = (rowsForQuery: Data) => {
    const narrowed = (next: Data) => builder(next);
    const chain = {
      select: () => chain,
      eq: (column: string, value: unknown) =>
        rowsForQuery.some((row) => column in row)
          ? narrowed(rowsForQuery.filter((row) => row[column] === value))
          : chain,
      in: (column: string, values: unknown[]) =>
        narrowed(rowsForQuery.filter((row) => values.includes(row[column]))),
      order: () => chain,
      maybeSingle: () => Promise.resolve({ data: rowsForQuery[0] ?? null, error: null }),
      then: (resolve: (value: { data: Data; error: null }) => unknown) =>
        Promise.resolve({ data: rowsForQuery, error: null }).then(resolve),
    };
    return chain;
  };

  return {
    billingHubSupabase: {
      from: (table: string) =>
        builder(table === "website_resources_public" ? (rows as unknown as Data) : extraRows[table] ?? []),
    },
    supabase: {},
  };
});

vi.mock("@/lib/tracking", () => ({
  trackHomeEvent: vi.fn(),
}));

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

describe("runtime resource routing", () => {
  afterEach(cleanup);

  it("renders a category index listing its article titles", async () => {
    renderAt("/resources/family-systems");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "Family Systems Resources" }),
      ).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("link", {
          name: /Coping With Limited or No Contact During a Military Separation/,
        }),
      ).toHaveAttribute(
        "href",
        "/resources/family-systems/military-separation-limited-communication",
      ),
    );

    expect(
      screen.queryByText(/Category body text that must not appear as an article/),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state for a category without articles", async () => {
    renderAt("/resources/empty-topic");

    await waitFor(() =>
      expect(screen.getByText(/New guidance for this topic is being written/)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Should not render as an article/)).not.toBeInTheDocument();
  });

  it("renders an article without public research metadata", async () => {
    renderAt("/resources/family-systems/military-separation-limited-communication");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Coping With Limited or No Contact During a Military Separation",
        }),
      ).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Daily routines" })).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { level: 2, name: "The direct answer" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Daily routines" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "A smaller detail" })).toBeInTheDocument();
    expect(screen.getByText("limited").tagName).toBe("STRONG");
    expect(screen.getByText("long stretches").tagName).toBe("EM");

    const listItem = screen.getByText("First practical step");
    const followingParagraph = screen.getByText("A paragraph after the list.");
    expect(
      listItem.compareDocumentPosition(followingParagraph) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const tocLinks = screen.getAllByRole("link", { name: "What families can do" });
    expect(tocLinks).toHaveLength(1);
    tocLinks.forEach((link) => expect(link).toHaveAttribute("href", "#what-families-can-do"));
    expect(screen.queryByText(/###/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last reviewed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last researched/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sources reviewed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Authoritative sources reviewed/i)).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("va.gov/example-source");
  });

  it("renders a future published article slug with no hardcoded route", async () => {
    renderAt("/resources/family-systems/a-future-article");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "A Future Runtime Article" }),
      ).toBeInTheDocument(),
    );
  });

  it("renders NotFound for unknown or draft slugs", async () => {
    renderAt("/resources/family-systems/not-a-real-article");
    await waitFor(() => expect(screen.getByText("Page not found")).toBeInTheDocument());
    cleanup();

    renderAt("/resources/not-a-real-category");
    await waitFor(() => expect(screen.getByText("Page not found")).toBeInTheDocument());
  });

  it("shows the quick answer, in-practice notes, sources, reviewer, related pages, and the therapist CTA", async () => {
    renderAt("/resources/for-therapists/how-valorwell-works");

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "How ValorWell Works for Therapists" })).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "The short answer" })).toBeInTheDocument();
    expect(screen.getByText("You make the clinical decisions and ValorWell handles billing.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What we see in practice" })).toBeInTheDocument();
    expect(screen.getByText("therapists").tagName).toBe("STRONG");
    expect(screen.getByText("Reviewed by ValorWell")).toBeInTheDocument();
    expect(screen.getByText("Last reviewed October 14, 2026")).toBeInTheDocument();
    expect(screen.getByText("Updated October 14, 2026")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "VA: Community Care" })).toHaveAttribute(
        "href",
        "https://www.va.gov/communitycare/",
      ),
    );
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /Telehealth Licensure Rules/ })[0]).toHaveAttribute(
        "href",
        "/resources/for-therapists/telehealth-rules",
      ),
    );
    expect(screen.getByRole("link", { name: "telehealth" })).toHaveAttribute(
      "href",
      "/resources/for-therapists/telehealth-rules",
    );
    expect(screen.getByRole("link", { name: "Work With ValorWell" })).toHaveAttribute("href", "/clinicians");
    expect(screen.getByRole("heading", { name: "Treat Veterans and their families with ValorWell" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Need care?" })).not.toBeInTheDocument();
  });

  it("groups a topic's articles under its sections in sheet order", async () => {
    renderAt("/resources/for-therapists");

    await waitFor(() => expect(screen.getByRole("heading", { level: 3, name: "Start Here" })).toBeInTheDocument());
    const startHere = screen.getByRole("heading", { level: 3, name: "Start Here" });
    const telehealth = screen.getByRole("heading", { level: 3, name: "Telehealth Practice" });
    expect(startHere.compareDocumentPosition(telehealth) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("Read these first.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Work With ValorWell/ })).toHaveAttribute("href", "/clinicians");
  });
});
