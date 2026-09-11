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

  it("explains ValorWell through the Care, Impact, and Community architecture", () => {
    renderAbout();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /ValorWell provides care\. The ValorWell Foundation separately funds therapy\./i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^ValorWell Care$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^ValorWell Foundation$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Community$/i })).toBeInTheDocument();
  });

  it("separates operating work from the Foundation and keeps clinical judgment clinician-led", () => {
    renderAbout();

    expect(screen.getByRole("heading", { name: /Care, charitable funding, and community work have different roles/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Nationwide mental-health care platform/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Direct payment for veteran therapy/i })).toBeInTheDocument();
    expect(
      screen.getByText(/remains clinician-led and subject to professional licensure/i),
    ).toBeInTheDocument();
  });

  it("publishes the founder role without assigning clinical authority to the founder", () => {
    renderAbout();

    expect(
      screen.getByRole("heading", {
        name: /Luke Predmore — Founder, ValorWell · Host, Beyond The Yellow/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/clinical care.*remains clinician-led.*professional licensure, scope, and judgment/i),
    ).toBeInTheDocument();
  });

  it("routes visitors into the current public architecture", () => {
    renderAbout();

    expect(screen.getAllByRole("link", { name: /Read the Mission/i })[0]).toHaveAttribute(
      "href",
      "/mission",
    );
    expect(screen.getAllByRole("link", { name: /Foundation Impact/i })[0]).toHaveAttribute(
      "href",
      "/impact",
    );
    expect(screen.getAllByRole("link", { name: /Find Care/i })[0]).toHaveAttribute(
      "href",
      "/get-care",
    );
    expect(screen.getAllByRole("link", { name: /Support the Foundation/i })[0]).toHaveAttribute(
      "href",
      "/impact",
    );
    expect(screen.getAllByRole("link", { name: /Beyond The Yellow/i })[0]).toHaveAttribute(
      "href",
      "/beyond-the-yellow",
    );
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
