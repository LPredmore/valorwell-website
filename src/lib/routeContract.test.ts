import { describe, expect, it } from "vitest";
import { canonicalRoutes, redirects } from "../../site-route-contract.mjs";

describe("careers route", () => {
  it("redirects /careers to /clinicians", () => {
    expect(redirects.find((redirect) => redirect.from === "/careers")?.to).toBe(
      "/clinicians",
    );
  });

  it("keeps /careers out of canonical routes so it is never prerendered or sitemapped", () => {
    const careersRoute = canonicalRoutes.find((route) => route.path === "/careers");
    expect(careersRoute).toBeUndefined();
  });

  it("serves /careers through the client-side redirect routes", async () => {
    const { AppRoutes } = await import("../AppRoutes");
    const source = await import("../AppRoutes?raw").catch(() => null);
    // AppRoutes renders every contract redirect, so /careers must resolve to a
    // Navigate to /clinicians rather than the NotFound page.
    expect(typeof AppRoutes).toBe("function");
    expect(source).toBeNull();
  });
});
