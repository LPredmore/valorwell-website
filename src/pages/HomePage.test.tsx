import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";
import { foundationImpactData } from "./homePageData";

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

  it("uses only the verified Foundation snapshot and excludes prohibited homepage copy", () => {
    const { container } = renderHome();

    expect(foundationImpactData).toEqual([
      {
        date: "2026-09-05",
        dateLabel: "Sep 5, 2026",
        therapyHours: 540,
        displayValue: "540+",
      },
    ]);
    expect(container.textContent).not.toContain("$75");
    expect(container.textContent).not.toMatch(/\[\[[\s\S]*?\]\]/);
    expect(screen.queryByText(/45\+/)).not.toBeInTheDocument();
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