import { describe, expect, it } from "vitest";
import { normalizeFeature, selectLatestFeature } from "./btyPublishedFeatures";
import { redirects, canonicalRoutes } from "../../site-route-contract.mjs";

describe("normalizeFeature", () => {
  it("maps valorwell feature URLs to internal paths with YouTube fallback image", () => {
    const f = normalizeFeature({
      organization_id: "a",
      organization_name: "GallantFew",
      summary: "Summary",
      feature_url: "https://www.valorwell.org/gallantfew",
      video_id: "zsaTKjNVeew",
      image_url: null,
    });
    expect(f?.internalPath).toBe("/gallantfew");
    expect(f?.imageUrl).toBe("https://i.ytimg.com/vi/zsaTKjNVeew/maxresdefault.jpg");
    expect(f?.videoUrl).toBe("https://www.youtube.com/watch?v=zsaTKjNVeew");
  });

  it("skips malformed rows", () => {
    expect(normalizeFeature({ organization_name: "X", summary: "", feature_url: "https://valorwell.org/x" })).toBeNull();
    expect(normalizeFeature({ organization_name: "X", summary: "S", feature_url: "javascript:alert(1)" })).toBeNull();
  });
});

describe("route contract", () => {
  it("redirects /watch and /videos to /network", () => {
    expect(redirects.find((r) => r.from === "/watch")?.to).toBe("/network");
    expect(redirects.find((r) => r.from === "/videos")?.to).toBe("/network");
  });

  it("publishes ACP and the two new feature pages in the sitemap", () => {
    for (const path of ["/americancorporatepartners", "/communion", "/service-dogs-of-distinction"]) {
      const route = canonicalRoutes.find((r) => r.path === path);
      expect(route?.indexable).toBe(true);
      expect(route?.sitemap).toBe(true);
    }
  });
});

describe("selectLatestFeature", () => {
  const base = { summary: "S", internalPath: null, featureUrl: "https://x.org", imageUrl: null, fallbackImageUrl: null, videoUrl: null };
  it("picks the newest published_at regardless of order and ignores missing dates", () => {
    const pick = selectLatestFeature([
      { ...base, id: "acp", name: "ACP", publishedAt: "2026-09-08T00:00:00Z" },
      { ...base, id: "none", name: "NoDate", publishedAt: null },
      { ...base, id: "sdod", name: "SDoD", publishedAt: "2026-10-05T00:00:00Z" },
      { ...base, id: "fish", name: "FISH", publishedAt: "2026-09-28T00:00:00Z" },
    ]);
    expect(pick?.id).toBe("sdod");
  });
  it("returns null for an empty catalog", () => {
    expect(selectLatestFeature([])).toBeNull();
  });
});
