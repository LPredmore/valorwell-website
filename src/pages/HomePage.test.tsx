import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./HomePage";

const { rpcMock, fetchFeaturesMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  fetchFeaturesMock: vi.fn(),
}));

vi.mock("@/lib/btyPublishedFeatures", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/btyPublishedFeatures")>()),
  fetchPublishedFeatures: fetchFeaturesMock,
}));

const latestFeature = {
  id: "sdod",
  name: "Newest Org",
  summary: "Newest summary.",
  internalPath: "/newest-org",
  featureUrl: "https://www.valorwell.org/newest-org",
  imageUrl: "https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg",
  fallbackImageUrl: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
  videoUrl: "https://www.youtube.com/watch?v=abcdefghijk",
  publishedAt: "2026-10-05T00:00:00Z",
};
const olderFeature = { ...latestFeature, id: "old", name: "Older Org", internalPath: "/older", publishedAt: "2026-09-08T00:00:00Z" };

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/SEO", () => ({
  SEO: () => null,
  OrganizationSchema: () => null,
}));

vi.mock("@/integrations/supabase/client", () => ({
  billingHubSupabase: {
    rpc: rpcMock,
  },
}));

vi.mock("@/lib/tracking", () => ({
  trackHomeEvent: vi.fn(),
}));

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ValorWell homepage", () => {
  beforeEach(() => {
    rpcMock.mockReset();
    fetchFeaturesMock.mockReset();
    fetchFeaturesMock.mockResolvedValue([olderFeature, latestFeature]);
    rpcMock.mockResolvedValue({
      data: [
        {
          month: "2025-09-01",
          documented_appointments: 21,
          displayed_value: 45,
        },
        {
          month: "2025-10-01",
          documented_appointments: 21,
          displayed_value: 45,
        },
        {
          month: "2026-09-01",
          documented_appointments: 5,
          displayed_value: 11,
        },
      ],
      error: null,
    });
  });

  afterEach(cleanup);

  it("renders the approved origin story and exact differentiation claim", () => {
    renderHome();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The VA said our kids were covered. No one would take the coverage.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "No one else is fixing this from both sides — inside the VA's own coverage programs, and outside them when the system still fails.",
      }),
    ).toBeInTheDocument();
  });

  it("loads exact monthly impact values from the database snapshot", async () => {
    const { container } = renderHome();

    expect(rpcMock).toHaveBeenCalledWith("get_homepage_documented_monthly_impact");
    expect(
      await screen.findByText("Sep 2025: 45."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Each month's impact is calculated from the actual live numbers in our database. The chart refreshes at the beginning of each month.",
      ),
    ).toBeInTheDocument();
    expect(container.textContent).not.toContain("2.13");
    expect(container.textContent).not.toContain("$75");
    expect(container.textContent).not.toMatch(/\[\[[\s\S]*?\]\]/);
    expect(screen.queryByText(/45\+/)).not.toBeInTheDocument();
  });

  it("does not substitute static chart data when the database snapshot is unavailable", async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { message: "unavailable" },
    });

    renderHome();

    expect(
      await screen.findByText("Monthly chart data is temporarily unavailable."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Sep 2025: 45.")).not.toBeInTheDocument();
  });

  it("shows the newest published BTY feature from the catalog", async () => {
    renderHome();
    expect(await screen.findByText("Newest Org")).toBeInTheDocument();
    expect(screen.getByText("Latest featured organization")).toBeInTheDocument();
    expect(screen.queryByText("Older Org")).not.toBeInTheDocument();
    expect(screen.queryByText(/Current episode/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read about Newest Org/ })).toHaveAttribute("href", "/newest-org");
    expect(screen.getByRole("link", { name: /Watch video/ })).toHaveAttribute("href", latestFeature.videoUrl);
  });

  it("omits the video link when the feature has no video", async () => {
    fetchFeaturesMock.mockResolvedValueOnce([{ ...latestFeature, videoUrl: null }]);
    renderHome();
    expect(await screen.findByText("Newest Org")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Watch video/ })).not.toBeInTheDocument();
  });

  it("falls back to the archive link when the catalog is empty or fails", async () => {
    fetchFeaturesMock.mockRejectedValue(new Error("down"));
    renderHome();
    expect(await screen.findByRole("link", { name: /See featured organizations/ })).toHaveAttribute("href", "/network");
    expect(screen.queryByText("American Corporate Partners")).not.toBeInTheDocument();
  });

  it("routes every required homepage action to a canonical destination", () => {
    renderHome();

    const expectedTargets = [
      "/about",
      "/get-care",
      "/how-it-works",
      "/impact",
      "/beyond-the-yellow",
      "/foundation",
      "/partner",
      "/clinicians",
      "/donate",
    ];
    const targets = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    for (const target of expectedTargets) {
      expect(targets).toContain(target);
    }
  });

  it("makes each involvement card a single accessible link", () => {
    renderHome();

    for (const name of [
      "Need Care: Find Care",
      "Fund a Session: Support the Foundation",
      "Partner or Feature: Partner With ValorWell",
      "Join the Network: Clinician Opportunities",
    ]) {
      const card = screen.getByRole("link", { name });
      expect(card.querySelector("a, button")).toBeNull();
    }
  });
});