import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AppRoutes } from "@/AppRoutes";

type Row = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  primary_question: string;
  summary: string;
  body_markdown: string;
  faq: { question: string; answer: string }[];
  audience_tags: string[];
  topic_aliases: string[];
  status: "published";
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

const base = {
  tenant_id: "00000000-0000-0000-0000-000000000001",
  primary_question: "",
  faq: [],
  audience_tags: [],
  topic_aliases: [],
  status: "published" as const,
  published_at: "2026-09-16T00:00:00Z",
  content_schema_version: 1,
  featured: false,
  sort_order: 100,
  seo_title: null,
  seo_description: null,
  public_updated_at: "2026-09-18T00:00:00Z",
};

const rows: Row[] = [
  {
    ...base,
    id: "00000000-0000-0000-0000-000000000101",
    slug: "family-systems",
    title: "Family Systems Resources",
    summary: "Shared frameworks families can use repeatedly.",
    body_markdown: "## About this category\n\nCategory body text should render as useful orientation.",
    editorial_type: "category",
    resource_kind: "category",
    category_slug: null,
  },
  {
    ...base,
    id: "00000000-0000-0000-0000-000000000102",
    slug: "empty-topic",
    title: "Empty Topic",
    summary: "No articles yet.",
    body_markdown: "## About this category\n\nThis topic is still being developed.",
    editorial_type: "category",
    resource_kind: "category",
    category_slug: null,
  },
  {
    ...base,
    id: "00000000-0000-0000-0000-000000000201",
    slug: "military-separation-limited-communication",
    title: "Coping With Limited or No Contact During a Military Separation",
    summary: "Practical ways military families can manage uncertainty.",
    body_markdown:
      "## What to expect\n\nCommunication can include **important details** and *careful context*. {% cite source=\"source-01\" /%}\n\n- First list item\n- Second list item\n\nParagraph after the list.\n\n### Daily routines\n\nKeep predictable anchors.\n\n## A second section\n\nMore guidance.\n\n## Authoritative sources reviewed\n\n- https://www.va.gov/example-source\n\nLast researched and verified: September 16, 2026",
    editorial_type: "guide",
    resource_kind: "article",
    category_slug: "family-systems",
  },
  {
    ...base,
    id: "00000000-0000-0000-0000-000000000202",
    slug: "a-future-article",
    title: "A Future Runtime Article",
    summary: "Published after the last deployment.",
    body_markdown:
      "{% answer %}\nA concise answer rendered through Markdoc.\n{% /answer %}\n\n## Overview\n\nRuntime content.",
    editorial_type: "guide",
    resource_kind: "article",
    category_slug: "family-systems",
  },
];

const sources = [
  {
    id: "00000000-0000-0000-0000-000000000301",
    tenant_id: "00000000-0000-0000-0000-000000000001",
    resource_id: "00000000-0000-0000-0000-000000000201",
    citation_key: "source-01",
    organization: "U.S. Department of Veterans Affairs",
    title: "Example official guidance",
    url: "https://www.va.gov/example-source",
    source_type: "official",
    source_published_at: null,
    verified_at: "2026-09-16T00:00:00Z",
    is_public: true,
    display_order: 10,
  },
];

const relations: Record<string, unknown>[] = [];

vi.mock("@/integrations/supabase/client", () => {
  const makeBuilder = (initialRows: Record<string, unknown>[]) => {
    const create = (currentRows: Record<string, unknown>[]) => {
      const chain = {
        select: () => chain,
        eq: (column: string, value: unknown) =>
          create(currentRows.filter((row) => row[column] === value)),
        in: (column: string, values: unknown[]) =>
          create(currentRows.filter((row) => values.includes(row[column]))),
        order: () => chain,
        limit: (count: number) => create(currentRows.slice(0, count)),
        maybeSingle: () =>
          Promise.resolve({ data: currentRows[0] ?? null, error: null }),
        then: (
          resolve: (value: { data: Record<string, unknown>[]; error: null }) => unknown,
        ) => Promise.resolve(resolve({ data: currentRows, error: null })),
      };
      return chain;
    };

    return create(initialRows);
  };

  return {
    billingHubSupabase: {
      from: (table: string) => {
        if (table === "website_resource_sources") {
          return makeBuilder(sources as unknown as Record<string, unknown>[]);
        }
        if (table === "website_resource_relations") {
          return makeBuilder(relations);
        }
        return makeBuilder(rows as unknown as Record<string, unknown>[]);
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

  it("renders a category as a topic hub with its stored orientation content", async () => {
    renderAt("/resources/family-systems");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "Family Systems Resources" }),
      ).toBeInTheDocument(),
    );

    expect(
      screen.getByText(/Category body text should render as useful orientation/),
    ).toBeInTheDocument();

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
  });

  it("shows an empty state for a category without articles", async () => {
    renderAt("/resources/empty-topic");

    await waitFor(() =>
      expect(screen.getByText(/New guidance for this topic is being written/)).toBeInTheDocument(),
    );
    expect(screen.getByText(/This topic is still being developed/)).toBeInTheDocument();
  });

  it("renders Markdoc hierarchy, inline formatting, citations, and structured sources", async () => {
    renderAt("/resources/family-systems/military-separation-limited-communication");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Coping With Limited or No Contact During a Military Separation",
        }),
      ).toBeInTheDocument(),
    );

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

    await waitFor(() =>
      expect(
        screen.getByRole("link", { name: "Example official guidance" }),
      ).toHaveAttribute("href", "https://www.va.gov/example-source"),
    );
    expect(screen.getByRole("link", { name: "Source 1" })).toHaveAttribute(
      "href",
      "#source-source-01",
    );

    expect(screen.queryByText(/Last researched/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Authoritative sources reviewed/i)).not.toBeInTheDocument();
  });

  it("renders semantic Markdoc components for future schema content", async () => {
    renderAt("/resources/family-systems/a-future-article");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "A Future Runtime Article" }),
      ).toBeInTheDocument(),
    );

    expect(screen.getByText("The direct answer")).toBeInTheDocument();
    expect(screen.getByText("A concise answer rendered through Markdoc.")).toBeInTheDocument();
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
