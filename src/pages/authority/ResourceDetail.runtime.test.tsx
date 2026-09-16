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

const rows: Row[] = [
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
      "## What to expect\n\nCommunication can be limited for long stretches.\n\n### Daily routines\n\nKeep predictable anchors.\n\n## Authoritative sources reviewed\n\n- https://www.va.gov/example-source\n\nLast researched and verified: September 16, 2026",
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

vi.mock("@/integrations/supabase/client", () => {
  const builder = (rowsForQuery: Row[]) => {
    const chain = {
      select: () => chain,
      eq: (column: string, value: string) => {
        if (column === "slug" || column === "resource_kind" || column === "category_slug") {
          return builder(
            rowsForQuery.filter((row) => (row as unknown as Record<string, unknown>)[column] === value),
          );
        }
        return chain;
      },
      order: () => Promise.resolve({ data: rowsForQuery, error: null }),
      maybeSingle: () => Promise.resolve({ data: rowsForQuery[0] ?? null, error: null }),
    };
    return chain;
  };

  return {
    billingHubSupabase: { from: () => builder(rows) },
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

    expect(screen.getByRole("heading", { name: "Daily routines" })).toBeInTheDocument();
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
});
