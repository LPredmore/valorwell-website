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
        name: /Mental health care, donor-funded therapy, public resources, and community conversations under one mission/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Care$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Impact$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Community$/i })).toBeInTheDocument();
  });

  it("separates operating work from the Foundation and keeps clinical judgment clinician-led", () => {
    renderAbout();

    expect(screen.getByRole("heading", { name: /Care operations and charitable support have different roles/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Care and operating work/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Charitable support for donor-funded therapy/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Clinical assessment, treatment planning, and treatment decisions remain with appropriately licensed treating clinicians/i),
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
    expect(screen.getAllByRole("link", { name: /Impact Details/i })[0]).toHaveAttribute(
      "href",
      "/impact",
    );
    expect(screen.getAllByRole("link", { name: /Find Care/i })[0]).toHaveAttribute(
      "href",
      "/get-care",
    );
    expect(screen.getAllByRole("link", { name: /Support ValorWell/i })[0]).toHaveAttribute(
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
