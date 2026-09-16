import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AppRoutes } from "@/AppRoutes";

const rows = [
  {
    slug: "a-future-slug",
    title: "A Future Runtime Resource",
    primary_question: "Does the generic route work?",
    summary: "Runtime-only resource published after the last deployment.",
    body_markdown: "## Overview\n\nRuntime content.",
    faq: [],
    audience_tags: [],
    topic_aliases: [],
    source_urls: [],
    coverage_status: "complete",
    status: "published",
    live_url: null,
    last_researched_at: null,
    published_at: null,
  },
];

vi.mock("@/integrations/supabase/client", () => {
  const builder = (rowsForQuery: typeof rows) => {
    const chain = {
      select: () => chain,
      eq: (column: string, value: string) => {
        if (column === "slug") {
          return builder(rowsForQuery.filter((row) => row.slug === value));
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

  it("renders a published slug that is not in the route contract", async () => {
    renderAt("/resources/a-future-slug");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: "A Future Runtime Resource" }),
      ).toBeInTheDocument(),
    );
  });

  it("renders NotFound for an unpublished or unknown slug", async () => {
    renderAt("/resources/not-a-real-slug");

    await waitFor(() => expect(screen.getByText("Page not found")).toBeInTheDocument());
  });
});
