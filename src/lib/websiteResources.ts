import { useQuery } from "@tanstack/react-query";
import { billingHubSupabase } from "@/integrations/supabase/client";
import {
  generatedWebsiteResources,
  type GeneratedWebsiteResource,
} from "@/generated/websiteResources";

export const WEBSITE_RESOURCE_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type WebsiteResourceFaq = {
  question: string;
  answer: string;
};

export type WebsiteResource = Omit<GeneratedWebsiteResource, "faq"> & {
  faq: WebsiteResourceFaq[];
};

const RESOURCE_COLUMNS =
  "slug,title,primary_question,summary,body_markdown,faq,audience_tags,topic_aliases,source_urls,coverage_status,status,live_url,last_researched_at,published_at";

function normalizeFaq(value: unknown): WebsiteResourceFaq[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Record<string, unknown>;
    if (
      typeof candidate.question !== "string" ||
      !candidate.question.trim() ||
      typeof candidate.answer !== "string" ||
      !candidate.answer.trim()
    ) {
      return [];
    }

    return [
      {
        question: candidate.question.trim(),
        answer: candidate.answer.trim(),
      },
    ];
  });
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeResource(row: Record<string, unknown>): WebsiteResource | null {
  if (typeof row.slug !== "string" || !row.slug.trim()) return null;
  if (typeof row.title !== "string" || !row.title.trim()) return null;

  return {
    slug: row.slug,
    title: row.title,
    primary_question: typeof row.primary_question === "string" ? row.primary_question : "",
    summary: typeof row.summary === "string" ? row.summary : "",
    body_markdown: typeof row.body_markdown === "string" ? row.body_markdown : "",
    faq: normalizeFaq(row.faq),
    audience_tags: normalizeStringArray(row.audience_tags),
    topic_aliases: normalizeStringArray(row.topic_aliases),
    source_urls: normalizeStringArray(row.source_urls),
    coverage_status:
      (row.coverage_status as WebsiteResource["coverage_status"]) ?? "needs_review",
    status: "published",
    live_url: typeof row.live_url === "string" ? row.live_url : null,
    last_researched_at:
      typeof row.last_researched_at === "string" ? row.last_researched_at : null,
    published_at: typeof row.published_at === "string" ? row.published_at : null,
  };
}

/**
 * Build/prerender-time snapshot. Used only to seed server-rendered HTML so SEO
 * snapshots are not blank; runtime Supabase data always supersedes it.
 */
const prerenderSnapshot: WebsiteResource[] = generatedWebsiteResources
  .map((resource) => normalizeResource(resource as unknown as Record<string, unknown>))
  .filter((resource): resource is WebsiteResource => resource !== null);

export async function fetchPublishedResources(): Promise<WebsiteResource[]> {
  const { data, error } = await billingHubSupabase
    .from("website_resources")
    .select(RESOURCE_COLUMNS)
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("status", "published")
    .order("title", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as Record<string, unknown>[])
    .map(normalizeResource)
    .filter((resource): resource is WebsiteResource => resource !== null);
}

export async function fetchPublishedResourceBySlug(
  slug: string,
): Promise<WebsiteResource | null> {
  const { data, error } = await billingHubSupabase
    .from("website_resources")
    .select(RESOURCE_COLUMNS)
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return normalizeResource(data as Record<string, unknown>);
}

export function usePublishedResources() {
  return useQuery({
    queryKey: ["website-resources", WEBSITE_RESOURCE_TENANT_ID],
    queryFn: fetchPublishedResources,
    initialData: prerenderSnapshot.length > 0 ? prerenderSnapshot : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function usePublishedResource(slug: string | undefined) {
  const seed = slug
    ? prerenderSnapshot.find((resource) => resource.slug === slug) ?? undefined
    : undefined;

  return useQuery({
    queryKey: ["website-resource", WEBSITE_RESOURCE_TENANT_ID, slug],
    queryFn: () => fetchPublishedResourceBySlug(slug as string),
    enabled: Boolean(slug),
    initialData: seed,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

/** Build/prerender only. Never use to decide what a browser user sees. */
export function getPrerenderResources(): WebsiteResource[] {
  return prerenderSnapshot;
}
