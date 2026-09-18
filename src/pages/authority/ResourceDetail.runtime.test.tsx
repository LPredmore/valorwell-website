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
  live_url: string | null;
  published_at: string | null;
  resource_kind: "category" | "article";
  category_slug: string | null;
  content_schema_version: number;
  editorial_type: "category" | "guide" | "explainer" | "checklist" | "reference";
  featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  public_updated_at: string | null;
};

const TENANT = "00000000-0000-0000-0000-000000000001";

const base = {
  tenant_id: TENANT,
  primary_question: "What should I know?",
  faq: [],
  audience_tags: [],
  topic_aliases: [],
  status: "published" as const,
  live_url: null,
  published_at: "2026-09-15T20:04:36.686535+00:00",
  content_schema_version: 1,
  featured: false,
  sort_order: 100,
  seo_title: null,
  seo_description: null,
  public_updated_at: "2026-09-18T12:00:00Z",
};

const rows: Row[] = [
  {
    ...base,
    id: "10000000-0000-4000-8000-000000000001",
    slug: "family-systems",
    title: "Family Systems Resources",
    summary: "Shared frameworks families can use repeatedly.",
    body_markdown: "## About this topic\n\nCategory body text should now help orient the reader.",
    resource_kind: "category",
    editorial_type: "category",
    category_slug: null,
  },
  {
    ...base,
    id: "10000000-0000-4000-8000-000000000002",
    slug: "empty-topic",
    title: "Empty Topic",
    summary: "No articles yet.",
    body_markdown: "## Empty topic\n\nThis category is still useful as an orientation page.",
    resource_kind: "category",
    editorial_type: "category",
    category_slug: null,
  },
  {
    ...base,
    id: "20000000-0000-4000-8000-000000000001",
    slug: "military-separation-limited-communication",
    title: "Coping With Limited or No Contact During a Military Separation",
    summary: "Practical ways military families can manage uncertainty.",
    body_markdown:
      "## What to expect\n\nCommunication can include **important details** and *careful context*.\n\n- First list item\n- Second list item\n\nParagraph after the list.\n\n### Daily routines\n\nKeep predictable anchors.\n\n## A second section\n\nMore guidance.\n\n## Authoritative sources reviewed\n\n- https://www.va.gov/example-source\n\nLast researched and verified: September 16, 2026",
    audience_tags: ["military spouses"],
    resource_kind: "article",
    editorial_type: "guide",
    category_slug: "family-systems",
    featured: true,
    sort_order: 10,
  },
  {
    ...base,
    id: "20000000-0000-4000-8000-000000000002",
    slug: "a-future-article",
    title: "A Future Runtime Article",
    summary: "Published after the last deployment.",
    body_markdown: "## Overview\n\nRuntime content.",
    resource_kind: "article",
    editorial_type: "explainer",
    category_slug: "family-systems",
  },
];

const sourceRows = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    resource_id: "20000000-0000-4000-8000-000000000001",
    citation_key: "source-01",
    organization: "U.S. Department of Veterans Affairs",
    title: "Official VA guidance",
    url: "https://www.va.gov/example-source",
    source_type: "official",
    source_published_at: null,
    verified_at: "2026-09-18T12:00:00Z",
    is_public: true,
    display_order: 10,
  },
];

vi.mock("@/integrations/supabase/client", () => {
  type GenericRow = Record<string, unknown>;

  const builder = (input: GenericRow[]) => {
    let current = [...input];

    const chain = {
      select: () => chain,
      eq: (column: string, value: unknown) => {
        current = current.filter((row) => row[column] === value);
        return chain;
      },
      neq: (column: string, value: unknown) => {
        current = current.filter((row) => row[column] !== value);
        return chain;
      },
      in: (column: string, values: unknown[]) => {
        current = current.filter((row) => values.includes(row[column]));
        return chain;
      },
      order: () => chain,
      limit: (count: number) => {
        current = current.slice(0, count);
        return chain;
      },
      maybeSingle: () => Promise.resolve({ data: current[0] ?? null, error: null }),
      then: (
        resolve: (value: { data: GenericRow[]; error: null }) => unknown,
        reject?: (reason: unknown) => unknown,
      ) => Promise.resolve({ data: current, error: null }).then(resolve, reject),
    };

    return chain;
  };

  return {
    billingHubSupabase: {
      from: (table: string) => {
        if (table === "website_resource_sources") {
          return builder(sourceRows as unknown as GenericRow[]);
        }
        if (table === "website_resource_relations") {
          return builder([]);
        }
        return builder(rows as unknown as GenericRow[]);
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

  it("renders a category as a topic hub with its orientation content and articles", async () => {
    renderAt("/resources/family-systems");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "Family Systems Resources" }),
      ).toBeInTheDocument(),
    );

    expect(
      screen.getByText(/Category body text should now help orient the reader/),
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
      expect(screen.getByText(/New guidance is being prepared/)).toBeInTheDocument(),
    );
    expect(
      screen.getByText(/This category is still useful as an orientation page/),
    ).toBeInTheDocument();
  });

  it("renders a Markdoc article with hierarchy, source references, and no internal research block", async () => {
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
      expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: /Official VA guidance/ }),
    ).toHaveAttribute("href", "https://www.va.gov/example-source");

    expect(screen.queryByText(/Last researched/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Authoritative sources reviewed/i)).not.toBeInTheDocument();
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
