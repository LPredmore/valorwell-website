import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DonateButton, ZEFFY_DONATION_FORM_URL } from "./DonateButton";
import { captureDonationAcquisition, clearDonationAcquisitionForTests } from "@/lib/donationAttribution";

describe("DonateButton", () => {
  afterEach(() => { cleanup(); clearDonationAcquisitionForTests(); });

  it("keeps a real donation link while enhancing it into an on-site modal", () => {
    render(
      <DonateButton source="mission-test" utmCampaign="mission-support">
        Support ValorWell
      </DonateButton>,
    );

    const link = screen.getByRole("link", { name: "Support ValorWell" });
    expect(link.getAttribute("href")).toBe(ZEFFY_DONATION_FORM_URL);
    expect(link.getAttribute("data-state")).toBe("closed");

    fireEvent.click(link);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByText("Donate to the ValorWell Foundation"),
    ).toBeTruthy();

    const frame = screen.getByTitle("ValorWell Foundation Bridge Fund donation form");
    expect(frame.getAttribute("src")).toBe(ZEFFY_DONATION_FORM_URL);
    expect(frame.getAttribute("allow")).toBe("payment *");
  });

  it("keeps CTA attribution on the donation link", () => {
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

    const link = screen.getByRole("link", { name: "Fund a Session" });
    expect(link.getAttribute("href")).toBe(ZEFFY_DONATION_FORM_URL);
    expect(link.getAttribute("data-donate-source")).toBe("impact-test");
    expect(link.getAttribute("data-donate-medium")).toBe("site");
    expect(link.getAttribute("data-donate-campaign")).toBe(
      "the-valorwell-bridge-fund",
    );
    expect(link.getAttribute("data-donate-content")).toBe("campaign-card");
  });

  it("passes a documented acquisition source without replacing it with CTA placement", () => {
    captureDonationAcquisition("?utm_source=google&gclid=private-click", "/", "");
    render(<DonateButton source="impact-test">Donate with source</DonateButton>);
    fireEvent.click(screen.getByRole("link", { name: "Donate with source" }));
    const frame = screen.getByTitle("ValorWell Foundation Bridge Fund donation form");
    const url = new URL(frame.getAttribute("src")!);
    expect(url.searchParams.get("UTM_source")).toBe("google");
    expect(url.searchParams.has("gclid")).toBe(false);
    expect(url.toString()).not.toContain("impact-test");
  });
});
