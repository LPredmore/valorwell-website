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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/how-it-works"]}>
      <HowItWorksPage />
    </MemoryRouter>,
  );
}

describe("How It Works page", () => {
  afterEach(cleanup);

  it("renders the three acts as one causal sequence", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Three programs. One reason they all exist.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("01 — CHAMPVA Access")).toBeInTheDocument();
    expect(screen.getByText("02 — VA Community Care (VACCN)")).toBeInTheDocument();
    expect(screen.getByText("03 — The ValorWell Foundation")).toBeInTheDocument();

    expect(
      screen.getByText(/The CHAMPVA network worked\. Then it became clear the same wall existed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Both of these fixes work — when the barrier is paperwork and process/i),
    ).toBeInTheDocument();
  });

  it("explains the real operational barriers and the Foundation stopgap", () => {
    renderPage();

    expect(screen.getAllByText(/reimbursement/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/credentialing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/paperwork/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/0% retained/i)).toBeInTheDocument();
    expect(
      screen.getByText(/100% of every donation goes directly to the treating therapist/i),
    ).toBeInTheDocument();
  });

  it("routes visitors through the story and into the Foundation funnel", () => {
    renderPage();

    expect(screen.getByRole("link", { name: /start with our story/i })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(
      screen.getByRole("link", { name: /Learn More About the Foundation/i }),
    ).toHaveAttribute("href", "/foundation");
    expect(screen.getByRole("link", { name: /Fund a Session — \$75/i })).toHaveAttribute(
      "href",
      "/donate",
    );
    expect(screen.getByRole("link", { name: /See the Foundation/i })).toHaveAttribute(
      "href",
      "/foundation",
    );
  });

  it("does not expose an advocacy link before that page exists", () => {
    renderPage();

    expect(screen.queryByRole("link", { name: /advocacy|asking the VA|pushing the VA/i })).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("link").some((link) => link.getAttribute("href") === "/advocacy"),
    ).toBe(false);
  });
});