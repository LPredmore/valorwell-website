import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { billingHubSupabase } from "@/integrations/supabase/client";
import { generatedWebsiteResources } from "@/generated/websiteResources";

export const WEBSITE_RESOURCE_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const faqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const resourceSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  primary_question: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  body_markdown: z.string().trim().min(1),
  faq: z.array(faqSchema).default([]),
  audience_tags: z.array(z.string()).default([]),
  topic_aliases: z.array(z.string()).default([]),
  status: z.literal("published"),
  live_url: z.string().nullable().default(null),
  published_at: z.string().nullable().default(null),
  resource_kind: z.enum(["category", "article"]),
  category_slug: z.string().nullable().default(null),
  content_schema_version: z.number().int().min(1).max(10).default(1),
  editorial_type: z.enum(["category", "guide", "explainer", "checklist", "reference"]),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(100),
  seo_title: z.string().nullable().default(null),
  seo_description: z.string().nullable().default(null),
  public_updated_at: z.string().nullable().default(null),
});

const sourceSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  citation_key: z.string().trim().min(1),
  organization: z.string().nullable().default(null),
  title: z.string().nullable().default(null),
  url: z.string().url(),
  source_type: z.enum([
    "official",
    "statute",
    "regulation",
    "policy",
    "clinical",
    "research",
    "other",
  ]),
  source_published_at: z.string().nullable().default(null),
  verified_at: z.string().nullable().default(null),
  display_order: z.number().int().default(100),
});

const relationSchema = z.object({
  resource_id: z.string().uuid(),
  related_resource_id: z.string().uuid(),
  relation_type: z.enum(["related", "next", "prerequisite", "start_here"]),
  display_order: z.number().int().default(100),
});

export type WebsiteResourceFaq = z.infer<typeof faqSchema>;
export type WebsiteResource = z.infer<typeof resourceSchema>;
export type WebsiteResourceKind = WebsiteResource["resource_kind"];
export type WebsiteResourceSource = z.infer<typeof sourceSchema>;
export type WebsiteResourceRelation = z.infer<typeof relationSchema>;

const RESOURCE_COLUMNS =
  "id,tenant_id,slug,title,primary_question,summary,body_markdown,faq,audience_tags,topic_aliases,status,live_url,published_at,resource_kind,category_slug,content_schema_version,editorial_type,featured,sort_order,seo_title,seo_description,public_updated_at";

const SOURCE_COLUMNS =
  "id,resource_id,citation_key,organization,title,url,source_type,source_published_at,verified_at,display_order";

function normalizeResource(row: unknown): WebsiteResource | null {
  const parsed = resourceSchema.safeParse(row);
  return parsed.success ? parsed.data : null;
}

function normalizeMany(data: unknown): WebsiteResource[] {
  if (!Array.isArray(data)) return [];

  return data
    .map(normalizeResource)
    .filter((resource): resource is WebsiteResource => resource !== null);
}

/**
 * Build/prerender-time snapshot. Runtime Supabase data always supersedes it.
 * The generated snapshot intentionally contains public-safe fields only.
 */
const prerenderSnapshot: WebsiteResource[] = (
  generatedWebsiteResources as unknown[]
)
  .map(normalizeResource)
  .filter((resource): resource is WebsiteResource => resource !== null);

function baseQuery() {
  return billingHubSupabase
    .from("website_resources_public")
    .select(RESOURCE_COLUMNS)
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("status", "published");
}

export async function fetchPublishedCategories(): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "category")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return normalizeMany(data).filter((resource) => resource.resource_kind === "category");
}


export async function fetchFeaturedArticles(): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "article")
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })
    .limit(6);

  if (error) throw error;
  return normalizeMany(data);
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

  const resource = normalizeResource(data);
  return resource?.resource_kind === "category" ? resource : null;
}

export async function fetchPublishedArticlesByCategory(
  categorySlug: string,
): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "article")
    .eq("category_slug", categorySlug)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
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

  const resource = normalizeResource(data);
  return resource &&
    resource.resource_kind === "article" &&
    resource.category_slug === categorySlug &&
    resource.slug === articleSlug
    ? resource
    : null;
}

export async function fetchPublicResourceSources(
  resourceId: string,
): Promise<WebsiteResourceSource[]> {
  const { data, error } = await billingHubSupabase
    .from("website_resource_sources")
    .select(SOURCE_COLUMNS)
    .eq("resource_id", resourceId)
    .eq("is_public", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return data.flatMap((row) => {
    const parsed = sourceSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}

async function fetchExplicitRelations(
  resourceId: string,
): Promise<WebsiteResourceRelation[]> {
  const { data, error } = await billingHubSupabase
    .from("website_resource_relations")
    .select("resource_id,related_resource_id,relation_type,display_order")
    .eq("resource_id", resourceId)
    .order("display_order", { ascending: true });

  if (error) throw error;
  if (!Array.isArray(data)) return [];

  return data.flatMap((row) => {
    const parsed = relationSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function fetchRelatedResources(
  resourceId: string,
  categorySlug: string,
): Promise<WebsiteResource[]> {
  const relations = await fetchExplicitRelations(resourceId);

  if (relations.length > 0) {
    const ids = relations.map((relation) => relation.related_resource_id);
    const { data, error } = await baseQuery()
      .eq("resource_kind", "article")
      .in("id", ids);

    if (error) throw error;

    const byId = new Map(
      normalizeMany(data).map((resource) => [resource.id, resource] as const),
    );

    return relations
      .map((relation) => byId.get(relation.related_resource_id))
      .filter((resource): resource is WebsiteResource => Boolean(resource))
      .slice(0, 3);
  }

  const { data, error } = await baseQuery()
    .eq("resource_kind", "article")
    .eq("category_slug", categorySlug)
    .neq("id", resourceId)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(3);

  if (error) throw error;
  return normalizeMany(data);
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


export function useFeaturedArticles() {
  const seed = prerenderSnapshot
    .filter((resource) => resource.resource_kind === "article" && resource.featured)
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        a.title.localeCompare(b.title),
    )
    .slice(0, 6);

  return useQuery({
    queryKey: ["website-resource-featured", WEBSITE_RESOURCE_TENANT_ID],
    queryFn: fetchFeaturedArticles,
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
    ? prerenderSnapshot
        .filter(
          (resource) =>
            resource.resource_kind === "article" && resource.category_slug === categorySlug,
        )
        .sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            a.sort_order - b.sort_order ||
            a.title.localeCompare(b.title),
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

export function usePublicResourceSources(resourceId: string | undefined) {
  return useQuery({
    queryKey: ["website-resource-sources", resourceId],
    queryFn: () => fetchPublicResourceSources(resourceId as string),
    enabled: Boolean(resourceId),
    staleTime: 5 * 60_000,
  });
}

export function useRelatedResources(
  resourceId: string | undefined,
  categorySlug: string | undefined,
) {
  return useQuery({
    queryKey: ["website-resource-related", resourceId, categorySlug],
    queryFn: () => fetchRelatedResources(resourceId as string, categorySlug as string),
    enabled: Boolean(resourceId && categorySlug),
    staleTime: 5 * 60_000,
  });
}

/** Build/prerender only. Never use to decide what a browser user sees. */
export function getPrerenderResources(): WebsiteResource[] {
  return prerenderSnapshot;
}
