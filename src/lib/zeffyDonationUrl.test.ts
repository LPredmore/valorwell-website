// Prepared only; NOT RUN. Deferred CRM Todoist task 42.
import { describe, expect, it } from "vitest";
import { createZeffyDonationFormUrl } from "./zeffyDonationUrl";

describe("Zeffy documented source handoff", () => {
  it("retains the exact donation form and modal while passing only a known acquisition channel", () => {
    const url = new URL(createZeffyDonationFormUrl(" Google "));
    expect(url.origin).toBe("https://www.zeffy.com");
    expect(url.pathname).toBe("/embed/donation-form/the-valorwell-bridge-fund");
    expect([...url.searchParams.entries()]).toEqual([["modal", "true"], ["UTM_source", "google"]]);
  });
  it("cannot pass arbitrary stored PII, click IDs, URL text or CTA names to Zeffy", () => {
    for (const value of [null, {}, "private@example.test", "gclid=abc", "https://private.test", "homepage-impact-donate"]) {
      expect(new URL(createZeffyDonationFormUrl(value)).searchParams.get("UTM_source")).toBe("website");
    }
  });
});
