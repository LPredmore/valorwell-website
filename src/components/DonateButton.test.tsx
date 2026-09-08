import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DonateButton, ZEFFY_DONATION_FORM_URL } from "./DonateButton";

describe("DonateButton", () => {
  afterEach(cleanup);

  it("opens the ValorWell Bridge Fund inside an on-site modal instead of navigating", () => {
    render(
      <DonateButton source="mission-test" utmCampaign="mission-support">
        Support ValorWell
      </DonateButton>,
    );

    const button = screen.getByRole("button", { name: "Support ValorWell" });
    expect(button.getAttribute("data-state")).toBe("closed");

    fireEvent.click(button);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByText("Donate to the ValorWell Bridge Fund"),
    ).toBeTruthy();

    const frame = screen.getByTitle("ValorWell Bridge Fund donation form");
    expect(frame.getAttribute("src")).toBe(ZEFFY_DONATION_FORM_URL);
    expect(frame.getAttribute("allow")).toBe("payment *");
  });

  it("keeps CTA attribution on the modal trigger", () => {
    render(
      <DonateButton
        source="impact-test"
        utmMedium="site"
        utmCampaign="the-valorwell-bridge-fund"
        utmContent="campaign-card"
      >
        Fund a Session
      </DonateButton>,
    );

    const button = screen.getByRole("button", { name: "Fund a Session" });
    expect(button.getAttribute("data-donate-source")).toBe("impact-test");
    expect(button.getAttribute("data-donate-medium")).toBe("site");
    expect(button.getAttribute("data-donate-campaign")).toBe(
      "the-valorwell-bridge-fund",
    );
    expect(button.getAttribute("data-donate-content")).toBe("campaign-card");
  });
});
