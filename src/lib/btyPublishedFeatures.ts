import { billingHubSupabase } from "@/integrations/supabase/client";

export const BTY_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type PublishedFeature = {
  id: string;
  name: string;
  summary: string;
  /** Internal path when the feature lives on valorwell.org, otherwise null. */
  internalPath: string | null;
  featureUrl: string;
  imageUrl: string | null;
  fallbackImageUrl: string | null;
  videoUrl: string | null;
  publishedAt: string | null;
};

const VALORWELL_HOSTS = new Set(["valorwell.org", "www.valorwell.org"]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function safeHttpUrl(value: unknown): URL | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** Normalizes one raw row; returns null for malformed rows so they are skipped. */
export function normalizeFeature(row: Record<string, unknown>): PublishedFeature | null {
  const name = typeof row.organization_name === "string" ? row.organization_name.trim() : "";
  const summary = typeof row.summary === "string" ? row.summary.trim() : "";
  const feature = safeHttpUrl(row.feature_url);
  if (!name || !summary || !feature) return null;

  const internalPath = VALORWELL_HOSTS.has(feature.hostname)
    ? `${feature.pathname}${feature.search}${feature.hash}` || "/"
    : null;
  const videoId = typeof row.video_id === "string" && YOUTUBE_ID.test(row.video_id.trim())
    ? row.video_id.trim()
    : null;
  const image = safeHttpUrl(row.image_url);

  return {
    id: String(row.organization_id ?? feature.href),
    name,
    summary,
    internalPath,
    featureUrl: feature.href,
    imageUrl: image?.href ?? (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null),
    fallbackImageUrl: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
    videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
  };
}

/** Returns the newest valid feature by publishedAt (nulls last), independent of input order. */
export function selectLatestFeature(features: PublishedFeature[]): PublishedFeature | null {
  const time = (f: PublishedFeature) => {
    const t = f.publishedAt ? Date.parse(f.publishedAt) : NaN;
    return Number.isNaN(t) ? -Infinity : t;
  };
  return features.reduce<PublishedFeature | null>(
    (best, f) => (best === null || time(f) > time(best) ? f : best),
    null,
  );
}

export async function fetchPublishedFeatures(): Promise<PublishedFeature[]> {
  const { data, error } = await billingHubSupabase
    .from("bty_published_features" as never)
    .select("organization_id, organization_name, feature_url, summary, video_id, image_url, published_at")
    .eq("tenant_id", BTY_TENANT_ID)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, unknown>[])
    .map(normalizeFeature)
    .filter((feature): feature is PublishedFeature => feature !== null);
}
