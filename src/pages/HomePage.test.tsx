import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

const { rpcMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

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
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <HomePage />
    </MemoryRouter>,
  );
}

describe("ValorWell homepage", () => {
  beforeEach(() => {
    rpcMock.mockReset();
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

  it("loads exact monthly documented-care values from the database aggregate", async () => {
    const { container } = renderHome();

    expect(rpcMock).toHaveBeenCalledWith("get_homepage_documented_monthly_impact");
    expect(
      await screen.findByText(
        "Sep 2025: 45 (21 documented appointments × 2.13, rounded).",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Each value is calculated from appointments marked documented for that month × 2\.13, rounded to the nearest whole number\./,
      ),
    ).toBeInTheDocument();
    expect(container.textContent).not.toContain("$75");
    expect(container.textContent).not.toMatch(/\[\[[\s\S]*?\]\]/);
    expect(screen.queryByText(/45\+/)).not.toBeInTheDocument();
  });

  it("does not substitute static chart data when the live aggregate is unavailable", async () => {
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { message: "unavailable" },
    });

    renderHome();

    expect(
      await screen.findByText("Live monthly chart data is temporarily unavailable."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/documented appointments × 2\.13, rounded\./),
    ).not.toBeInTheDocument();
  });

  it("features the current American Corporate Partners episode", () => {
    renderHome();

    const episode = screen.getByRole("link", {
      name: /American Corporate Partners Beyond The Yellow conversation/i,
    });
    expect(episode).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=JHuLEqw2yG8",
    );
    expect(screen.queryByText("Veterans Breakfast Club")).not.toBeInTheDocument();
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
