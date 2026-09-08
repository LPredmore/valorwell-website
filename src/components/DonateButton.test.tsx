import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DonateButton, ZEFFY_DONATION_FORM_URL } from "./DonateButton";

describe("DonateButton", () => {
  afterEach(() => {
    cleanup();
    document.getElementById("zeffy-embed-script")?.remove();
  });

  it("uses the ValorWell Bridge Fund Zeffy modal as the only donation destination", () => {
    render(
      <DonateButton source="mission-test" utmCampaign="mission-support">
        Support ValorWell
      </DonateButton>,
    );

    const link = screen.getByRole("link", { name: "Support ValorWell" });
    expect(link.getAttribute("href")).toBe(ZEFFY_DONATION_FORM_URL);
    expect(link.getAttribute("zeffy-form-link")).toBe(ZEFFY_DONATION_FORM_URL);
    expect(link.getAttribute("aria-haspopup")).toBe("dialog");
  });

  it("keeps CTA attribution in ValorWell data attributes and loads Zeffy's embed script", () => {
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
    expect(link.getAttribute("data-donate-source")).toBe("impact-test");
    expect(link.getAttribute("data-donate-medium")).toBe("site");
    expect(link.getAttribute("data-donate-campaign")).toBe(
      "the-valorwell-bridge-fund",
    );
    expect(link.getAttribute("data-donate-content")).toBe("campaign-card");

    const script = document.getElementById("zeffy-embed-script");
    expect(script?.getAttribute("src")).toBe(
      "https://www.zeffy.com/embed/v2/zeffy-embed.js",
    );
  });
});
