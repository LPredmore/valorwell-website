import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AboutPage from "./AboutPage";

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

function renderAbout() {
  return render(
    <MemoryRouter initialEntries={["/about"]}>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe("About ValorWell page", () => {
  afterEach(cleanup);

  it("opens with the family origin and the decision to build for everyone", () => {
    renderAbout();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "ValorWell started with a father willing to build a company just to get his kids care — and a mother who refused to let it stop with them.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The idea began with our family\. The company began with a promise/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/In 2023, my family had CHAMPVA coverage through the VA/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Who would we be if we just did this for ourselves\?/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/when we started the company in 2023, it was never meant to belong only to us/i),
    ).toBeInTheDocument();
  });

  it("keeps the specific provider reasons that drove the CHAMPVA access problem", () => {
    renderAbout();

    expect(screen.getByText(/too much paperwork/i)).toBeInTheDocument();
    expect(screen.getByText(/reimbursement rates that were too low/i)).toBeInTheDocument();
    expect(screen.getByText(/credentialing that moved too slowly/i)).toBeInTheDocument();
    expect(
      screen.getByText(/coverage that no one will accept isn't coverage\. It's a document\./i),
    ).toBeInTheDocument();
  });

  it("shows the verified 2023 and 2024 progression into Community Care and the Foundation", () => {
    renderAbout();

    expect(screen.getAllByText("2023")).toHaveLength(2);
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(
      screen.getByText(/In 2024, we started trying to integrate with VA Community Care/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/That is why we started the ValorWell Foundation/i),
    ).toBeInTheDocument();
  });

  it("describes the model as working inside coverage and bridging structural gaps", () => {
    renderAbout();

    expect(
      screen.getByText(/some gaps are in the design of the system itself/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ValorWell works inside VA-related coverage systems/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The Foundation covers therapy when those systems still leave a veteran without treatment/i),
    ).toBeInTheDocument();
  });

  it("routes the final handoff to How It Works and does not expose an advocacy link", () => {
    renderAbout();

    expect(screen.getByRole("link", { name: /See How It Works/i })).toHaveAttribute(
      "href",
      "/how-it-works",
    );

    const links = screen.getAllByRole("link");
    expect(links.some((link) => link.getAttribute("href") === "/advocacy")).toBe(false);
  });

  it("uses no page-level images or leadership section", () => {
    const { container } = renderAbout();

    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByText(/Who's Behind ValorWell/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Luke Predmore — Founder/i)).not.toBeInTheDocument();
  });

  it("does not expose Operation Claims Success", () => {
    renderAbout();

    const links = screen.getAllByRole("link");
    expect(
      links.some((link) => link.getAttribute("href") === "/operation-claims-success"),
    ).toBe(false);
    expect(screen.queryByText(/Operation Claims Success/i)).not.toBeInTheDocument();
  });
});
