import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AppRoutes } from "@/AppRoutes";

type ResourceRow = {
  id: string;
  slug: string;
  title: string;
  primary_question: string;
  summary: string;
  body_markdown: string;
  faq: { question: string; answer: string }[];
  audience_tags: string[];
  topic_aliases: string[];
  status: "published";
  live_url: string | null;
  published_at: string | null;
  resource_kind: "category" | "article";
  category_slug: string | null;
  content_schema_version: number;
  editorial_type: "category" | "guide";
  featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  public_updated_at: string | null;
};

const categoryId = "11111111-1111-4111-8111-111111111111";
const emptyCategoryId = "22222222-2222-4222-8222-222222222222";
const articleId = "33333333-3333-4333-8333-333333333333";
const futureArticleId = "44444444-4444-4444-8444-444444444444";

const base = {
  primary_question: "What should someone know?",
  faq: [],
  audience_tags: ["military families"],
  topic_aliases: [],
  status: "published" as const,
  live_url: null,
  published_at: "2026-09-16T00:00:00Z",
  content_schema_version: 1,
  featured: false,
  sort_order: 100,
  seo_title: null,
  seo_description: null,
  public_updated_at: "2026-09-18T00:00:00Z",
};

const resourceRows: ResourceRow[] = [
  {
    ...base,
    id: categoryId,
    slug: "family-systems",
    title: "Family Systems Resources",
    summary: "Shared frameworks families can use repeatedly.",
    body_markdown:
      "## About this category\n\nCategory body text should appear in the topic center.",
    resource_kind: "category",
    category_slug: null,
    editorial_type: "category",
  },
  {
    ...base,
    id: emptyCategoryId,
    slug: "empty-topic",
    title: "Empty Topic",
    summary: "No articles yet.",
    body_markdown: "## About this topic\n\nA useful category overview.",
    resource_kind: "category",
    category_slug: null,
    editorial_type: "category",
  },
  {
    ...base,
    id: articleId,
    slug: "military-separation-limited-communication",
    title: "Coping With Limited or No Contact During a Military Separation",
    summary: "Practical ways military families can manage uncertainty.",
    body_markdown:
      "{% answer %}\nCommunication can be limited without meaning the relationship is in trouble.\n{% /answer %}\n\n## What to expect\n\nCommunication can include **important details** and *careful context*.\n\n- First list item\n- Second list item\n\nParagraph after the list.\n\n### Daily routines\n\nKeep predictable anchors.\n\n## A second section\n\nMore guidance.\n\n## Authoritative sources reviewed\n\n- https://www.va.gov/internal-example\n\nLast researched and verified: September 16, 2026",
    faq: [
      {
        question: "Can communication be irregular?",
        answer: "Yes. Schedules and access can change.",
      },
    ],
    resource_kind: "article",
    category_slug: "family-systems",
    editorial_type: "guide",
    featured: true,
    sort_order: 10,
  },
  {
    ...base,
    id: futureArticleId,
    slug: "a-future-article",
    title: "A Future Runtime Article",
    summary: "Published after the last deployment.",
    body_markdown: "## Overview\n\nRuntime content.",
    resource_kind: "article",
    category_slug: "family-systems",
    editorial_type: "guide",
  },
];

const sourceRows = [
  {
    id: "55555555-5555-4555-8555-555555555555",
    resource_id: articleId,
    citation_key: "source-01",
    organization: "Military OneSource",
    title: "Deployment Resources for Families",
    url: "https://www.militaryonesource.mil/example-public-source/",
    source_type: "official",
    source_published_at: null,
    verified_at: "2026-09-18T00:00:00Z",
    is_public: true,
    display_order: 10,
  },
];

const relationRows: never[] = [];

vi.mock("@/generated/websiteResources", () => ({
  generatedWebsiteResources: [],
  generatedWebsiteResourceSources: [],
  generatedWebsiteResourceRelations: [],
}));

vi.mock("@/integrations/supabase/client", () => {
  const makeBuilder = (initialRows: Record<string, unknown>[]) => {
    let currentRows = [...initialRows];

    const chain = {
      select: () => chain,
      eq: (column: string, value: unknown) => {
        currentRows = currentRows.filter((row) => row[column] === value);
        return chain;
      },
      in: (column: string, values: unknown[]) => {
        currentRows = currentRows.filter((row) => values.includes(row[column]));
        return chain;
      },
      order: () => chain,
      maybeSingle: () =>
        Promise.resolve({ data: currentRows[0] ?? null, error: null }),
      then: (
        resolve: (value: { data: Record<string, unknown>[]; error: null }) => unknown,
      ) => Promise.resolve({ data: currentRows, error: null }).then(resolve),
    };

    return chain;
  };

  return {
    billingHubSupabase: {
      from: (table: string) => {
        if (table === "website_resource_sources") {
          return makeBuilder(sourceRows as unknown as Record<string, unknown>[]);
        }
        if (table === "website_resource_relations") {
          return makeBuilder(relationRows);
        }
        return makeBuilder(resourceRows as unknown as Record<string, unknown>[]);
      },
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

  it("renders a category topic center with its overview and article cards", async () => {
    renderAt("/resources/family-systems");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "Family Systems" }),
      ).toBeInTheDocument(),
    );

    expect(
      await screen.findByText(/Category body text should appear in the topic center/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /Coping With Limited or No Contact During a Military Separation/,
      }),
    ).toHaveAttribute(
      "href",
      "/resources/family-systems/military-separation-limited-communication",
    );
  });

  it("shows an empty article state while preserving category guidance", async () => {
    renderAt("/resources/empty-topic");

    expect(
      await screen.findByText(/New guidance for this topic is being written/),
    ).toBeInTheDocument();
    expect(screen.getByText(/A useful category overview/)).toBeInTheDocument();
  });

  it("renders Markdoc hierarchy, semantic blocks, FAQs, and public sources", async () => {
    renderAt("/resources/family-systems/military-separation-limited-communication");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Coping With Limited or No Contact During a Military Separation",
        }),
      ).toBeInTheDocument(),
    );

    expect(screen.getByText("Direct answer")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "What to expect" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Daily routines" }),
    ).toBeInTheDocument();

    expect(screen.getByText("important details", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("careful context", { selector: "em" })).toBeInTheDocument();

    const listItem = screen.getByText("First list item");
    const afterList = screen.getByText("Paragraph after the list.");
    expect(
      listItem.compareDocumentPosition(afterList) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const tocLinks = screen.getAllByRole("link", { name: "What to expect" });
    expect(tocLinks.some((link) => link.getAttribute("href") === "#what-to-expect")).toBe(true);

    expect(
      screen.getByRole("heading", { name: "Frequently asked questions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Authoritative sources" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Deployment Resources for Families/ }),
    ).toHaveAttribute("href", "https://www.militaryonesource.mil/example-public-source/");

    expect(screen.queryByText(/Last researched/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sources reviewed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Authoritative sources reviewed/i)).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("va.gov/internal-example");
  });

  it("renders a future published article slug with no hardcoded route", async () => {
    renderAt("/resources/family-systems/a-future-article");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "A Future Runtime Article" }),
      ).toBeInTheDocument(),
    );
  });

  it("renders NotFound for unknown slugs", async () => {
    renderAt("/resources/family-systems/not-a-real-article");
    await waitFor(() => expect(screen.getByText("Page not found")).toBeInTheDocument());
    cleanup();

    renderAt("/resources/not-a-real-category");
    await waitFor(() => expect(screen.getByText("Page not found")).toBeInTheDocument());
  });
});
