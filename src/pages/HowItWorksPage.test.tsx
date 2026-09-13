import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HowItWorksPage from "./HowItWorksPage";

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/SEO", () => ({
  SEO: () => null,
  BreadcrumbSchema: () => null,
}));

vi.mock("@/lib/tracking", () => ({
  trackHomeEvent: vi.fn(),
}));

describe("How It Works page", () => {
  afterEach(cleanup);

  it("renders a complete three-path explanation", () => {
    render(
      <MemoryRouter initialEntries={["/how-it-works"]}>
        <HowItWorksPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "One access problem. Three ways we learned to attack it.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("01 — CHAMPVA")).toBeInTheDocument();
    expect(screen.getByText("02 — VA Community Care (VACCN)")).toBeInTheDocument();
    expect(screen.getByText("03 — ValorWell Foundation")).toBeInTheDocument();
  });

  it("routes visitors by situation", () => {
    render(
      <MemoryRouter initialEntries={["/how-it-works"]}>
        <HowItWorksPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Find Care/i })).toHaveAttribute("href", "/get-care");
    expect(screen.getByRole("link", { name: /Foundation Impact/i })).toHaveAttribute("href", "/impact");
  });
});