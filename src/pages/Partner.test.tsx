import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Partner from "./Partner";

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

function renderPartner() {
  return render(
    <MemoryRouter initialEntries={["/partner"]}>
      <Partner />
    </MemoryRouter>,
  );
}

describe("Partner organizational collaboration page", () => {
  afterEach(cleanup);

  it("leads with a concrete partnership outcome", () => {
    renderPartner();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Build a partnership around a specific way to help/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Partnership Approach")).toBeInTheDocument();
    expect(screen.getByText("Ways to Work Together")).toBeInTheDocument();
    expect(screen.queryByText("Bridge the Wait")).not.toBeInTheDocument();
  });

  it("routes the primary partnership action to Contact", () => {
    renderPartner();

    expect(
      screen.getAllByRole("link", { name: /Start a Partnership Conversation/i })[0],
    ).toHaveAttribute("href", "/contact");
  });

  it("keeps financial support and clinical decisions separate from partnership", () => {
    renderPartner();

    expect(screen.getByText("Important Boundaries")).toBeInTheDocument();
    expect(
      screen.getByText(/Financial support does not purchase treatment priority, referrals, endorsements, or Beyond The Yellow editorial selection/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Clinical decisions remain with the treating clinician/i),
    ).toBeInTheDocument();
  });

  it("routes into the current community architecture", () => {
    renderPartner();

    expect(
      screen.getByRole("link", { name: /Explore Beyond The Yellow/i }),
    ).toHaveAttribute("href", "/beyond-the-yellow");
    expect(screen.getByRole("link", { name: /Explore the Network/i })).toHaveAttribute(
      "href",
      "/network",
    );
    expect(screen.getByRole("link", { name: /Contact ValorWell/i })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("does not expose Operation Claims Success as a partnership route", () => {
    renderPartner();

    const links = screen.getAllByRole("link");
    expect(
      links.some((link) => link.getAttribute("href") === "/operation-claims-success"),
    ).toBe(false);
  });
});
