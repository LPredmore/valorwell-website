import { useQuery } from "@tanstack/react-query";
import { billingHubSupabase } from "@/integrations/supabase/client";
import { generatedWebsiteResources } from "@/generated/websiteResources";

export const WEBSITE_RESOURCE_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type WebsiteResourceFaq = {
  question: string;
  answer: string;
};

export type WebsiteResourceKind = "category" | "article";

export type WebsiteResource = {
  slug: string;
  title: string;
  primary_question: string;
  summary: string;
  body_markdown: string;
  faq: WebsiteResourceFaq[];
  audience_tags: string[];
  topic_aliases: string[];
  /** Internal research tracking only. Never rendered publicly. */
  source_urls: string[];
  coverage_status: "partial" | "complete" | "needs_review";
  status: "published";
  live_url: string | null;
  /** Internal research tracking only. Never rendered publicly. */
  last_researched_at: string | null;
  published_at: string | null;
  resource_kind: WebsiteResourceKind;
  category_slug: string | null;
};

const RESOURCE_COLUMNS =
  "slug,title,primary_question,summary,body_markdown,faq,audience_tags,topic_aliases,source_urls,coverage_status,status,live_url,last_researched_at,published_at,resource_kind,category_slug";

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

  const kind = row.resource_kind === "article" ? "article" : "category";

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
    resource_kind: kind,
    category_slug: typeof row.category_slug === "string" ? row.category_slug : null,
  };
}

/**
 * Build/prerender-time snapshot. Used only to seed server-rendered HTML so SEO
 * snapshots are not blank; runtime Supabase data always supersedes it.
 */
const prerenderSnapshot: WebsiteResource[] = (
  generatedWebsiteResources as unknown as Record<string, unknown>[]
)
  .map(normalizeResource)
  .filter((resource): resource is WebsiteResource => resource !== null);

function baseQuery() {
  return billingHubSupabase
    .from("website_resources")
    .select(RESOURCE_COLUMNS)
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("status", "published");
}

function normalizeMany(data: unknown): WebsiteResource[] {
  return ((data ?? []) as Record<string, unknown>[])
    .map(normalizeResource)
    .filter((resource): resource is WebsiteResource => resource !== null);
}

export async function fetchPublishedCategories(): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "category")
    .order("title", { ascending: true });

  if (error) throw error;
  return normalizeMany(data).filter((resource) => resource.resource_kind === "category");
}

export async function fetchPublishedCategoryBySlug(
  slug: string,
): Promise<WebsiteResource | null> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "category")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const resource = normalizeResource(data as Record<string, unknown>);
  return resource && resource.resource_kind === "category" ? resource : null;
}

export async function fetchPublishedArticlesByCategory(
  categorySlug: string,
): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "article")
    .eq("category_slug", categorySlug)
    .order("title", { ascending: true });

  if (error) throw error;
  return normalizeMany(data).filter(
    (resource) =>
      resource.resource_kind === "article" && resource.category_slug === categorySlug,
  );
}

export async function fetchPublishedArticle(
  categorySlug: string,
  articleSlug: string,
): Promise<WebsiteResource | null> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "article")
    .eq("category_slug", categorySlug)
    .eq("slug", articleSlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const resource = normalizeResource(data as Record<string, unknown>);
  return resource &&
    resource.resource_kind === "article" &&
    resource.category_slug === categorySlug &&
    resource.slug === articleSlug
    ? resource
    : null;
}

export function usePublishedCategories() {
  const seed = prerenderSnapshot.filter((resource) => resource.resource_kind === "category");

  return useQuery({
    queryKey: ["website-resource-categories", WEBSITE_RESOURCE_TENANT_ID],
    queryFn: fetchPublishedCategories,
    initialData: seed.length > 0 ? seed : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function usePublishedCategory(slug: string | undefined) {
  const seed = slug
    ? prerenderSnapshot.find(
        (resource) => resource.slug === slug && resource.resource_kind === "category",
      ) ?? undefined
    : undefined;

  return useQuery({
    queryKey: ["website-resource-category", WEBSITE_RESOURCE_TENANT_ID, slug],
    queryFn: () => fetchPublishedCategoryBySlug(slug as string),
    enabled: Boolean(slug),
    initialData: seed,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function usePublishedCategoryArticles(categorySlug: string | undefined) {
  const seed = categorySlug
    ? prerenderSnapshot.filter(
        (resource) =>
          resource.resource_kind === "article" && resource.category_slug === categorySlug,
      )
    : [];

  return useQuery({
    queryKey: ["website-resource-articles", WEBSITE_RESOURCE_TENANT_ID, categorySlug],
    queryFn: () => fetchPublishedArticlesByCategory(categorySlug as string),
    enabled: Boolean(categorySlug),
    initialData: seed.length > 0 ? seed : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function usePublishedArticle(
  categorySlug: string | undefined,
  articleSlug: string | undefined,
) {
  const seed =
    categorySlug && articleSlug
      ? prerenderSnapshot.find(
          (resource) =>
            resource.resource_kind === "article" &&
            resource.category_slug === categorySlug &&
            resource.slug === articleSlug,
        ) ?? undefined
      : undefined;

  return useQuery({
    queryKey: ["website-resource-article", WEBSITE_RESOURCE_TENANT_ID, categorySlug, articleSlug],
    queryFn: () => fetchPublishedArticle(categorySlug as string, articleSlug as string),
    enabled: Boolean(categorySlug && articleSlug),
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
