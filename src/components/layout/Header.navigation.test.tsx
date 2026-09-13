import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./Header";

describe("Header primary navigation", () => {
  afterEach(cleanup);

  it("shows the approved primary routes in order", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const primaryLinks = within(nav)
      .getAllByRole("link")
      .filter((link) =>
        ["About", "How It Works", "Beyond The Yellow", "Resources"].includes(
          link.textContent?.trim() ?? "",
        ),
      );

    expect(primaryLinks.map((link) => link.textContent?.trim())).toEqual([
      "About",
      "How It Works",
      "Beyond The Yellow",
      "Resources",
    ]);
    expect(primaryLinks[1]).toHaveAttribute("href", "/how-it-works");
    expect(within(nav).queryByRole("link", { name: "Impact" })).not.toBeInTheDocument();
  });
});