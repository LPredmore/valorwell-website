import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { billingHubSupabase } from "@/integrations/supabase/client";
import { generatedWebsiteResources } from "@/generated/websiteResources";

export const WEBSITE_RESOURCE_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type WebsiteResourceFaq = {
  question: string;
  answer: string;
};

export type WebsiteResourceKind = "category" | "article";
export type WebsiteResourceEditorialType =
  | "category"
  | "guide"
  | "explainer"
  | "checklist"
  | "reference";

export type WebsiteResource = {
  id: string;
  slug: string;
  title: string;
  primary_question: string;
  summary: string;
  body_markdown: string;
  faq: WebsiteResourceFaq[];
  audience_tags: string[];
  topic_aliases: string[];
  status: "published";
  published_at: string | null;
  resource_kind: WebsiteResourceKind;
  category_slug: string | null;
  content_schema_version: number;
  editorial_type: WebsiteResourceEditorialType;
  featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  public_updated_at: string | null;
};

export type WebsiteResourceSource = {
  id: string;
  citation_key: string;
  organization: string | null;
  title: string | null;
  url: string;
  source_type: string;
  source_published_at: string | null;
  verified_at: string | null;
  display_order: number;
};

export type WebsiteResourceRelationType =
  | "related"
  | "start_here"
  | "next"
  | "previous";

export type WebsiteResourceRelation = {
  resource: WebsiteResource;
  relation_type: WebsiteResourceRelationType;
  display_order: number;
};

const faqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const resourceSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  primary_question: z.string().default(""),
  summary: z.string().default(""),
  body_markdown: z.string().default(""),
  faq: z.array(faqSchema).default([]),
  audience_tags: z.array(z.string()).default([]),
  topic_aliases: z.array(z.string()).default([]),
  status: z.literal("published"),
  published_at: z.string().nullable().default(null),
  resource_kind: z.enum(["category", "article"]).default("article"),
  category_slug: z.string().nullable().default(null),
  content_schema_version: z.coerce.number().int().min(1).default(1),
  editorial_type: z
    .enum(["category", "guide", "explainer", "checklist", "reference"])
    .default("guide"),
  featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(100),
  seo_title: z.string().nullable().default(null),
  seo_description: z.string().nullable().default(null),
  public_updated_at: z.string().nullable().default(null),
});

const sourceSchema = z.object({
  id: z.string().uuid(),
  citation_key: z.string().trim().min(1),
  organization: z.string().nullable().default(null),
  title: z.string().nullable().default(null),
  url: z.string().trim().min(1),
  source_type: z.string().default("official"),
  source_published_at: z.string().nullable().default(null),
  verified_at: z.string().nullable().default(null),
  display_order: z.coerce.number().int().default(100),
});

const RESOURCE_COLUMNS = [
  "id",
  "slug",
  "title",
  "primary_question",
  "summary",
  "body_markdown",
  "faq",
  "audience_tags",
  "topic_aliases",
  "status",
  "published_at",
  "resource_kind",
  "category_slug",
  "content_schema_version",
  "editorial_type",
  "featured",
  "sort_order",
  "seo_title",
  "seo_description",
  "public_updated_at",
].join(",");

function normalizeResource(row: Record<string, unknown>): WebsiteResource | null {
  const parsed = resourceSchema.safeParse(row);
  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.warn("Ignoring invalid website resource row", parsed.error.flatten());
    }
    return null;
  }

  return parsed.data;
}

function normalizeMany(data: unknown): WebsiteResource[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((row) => normalizeResource(row as Record<string, unknown>))
    .filter((resource): resource is WebsiteResource => resource !== null);
}

/**
 * Build/prerender-time snapshot. Used only to seed server-rendered HTML so SEO
 * snapshots are complete; runtime Supabase data supersedes it in the browser.
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

export async function fetchPublishedCategories(): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "category")
    .order("sort_order", { ascending: true })
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

  const resource = normalizeResource(data as Record<string, unknown>);
  return resource &&
    resource.resource_kind === "article" &&
    resource.category_slug === categorySlug &&
    resource.slug === articleSlug
    ? resource
    : null;
}

export async function fetchPublishedFeaturedArticles(): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "article")
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })
    .limit(6);

  if (error) throw error;
  return normalizeMany(data).filter((resource) => resource.resource_kind === "article");
}

export async function fetchPublicResourceSources(
  resourceId: string,
): Promise<WebsiteResourceSource[]> {
  const { data, error } = await billingHubSupabase
    .from("website_resource_sources")
    .select(
      "id,citation_key,organization,title,url,source_type,source_published_at,verified_at,display_order",
    )
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
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

export async function fetchRelatedResources(
  resourceId: string,
): Promise<WebsiteResourceRelation[]> {
  const { data: relationRows, error: relationError } = await billingHubSupabase
    .from("website_resource_relations")
    .select("related_resource_id,relation_type,display_order")
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("resource_id", resourceId)
    .order("display_order", { ascending: true });

  if (relationError) throw relationError;
  if (!Array.isArray(relationRows) || relationRows.length === 0) return [];

  const relatedIds = relationRows
    .map((row) =>
      typeof row.related_resource_id === "string" ? row.related_resource_id : null,
    )
    .filter((id): id is string => Boolean(id));

  if (relatedIds.length === 0) return [];

  const { data: resources, error: resourceError } = await baseQuery().in("id", relatedIds);
  if (resourceError) throw resourceError;

  const byId = new Map(normalizeMany(resources).map((resource) => [resource.id, resource]));

  return relationRows.flatMap((row) => {
    const resource =
      typeof row.related_resource_id === "string"
        ? byId.get(row.related_resource_id)
        : undefined;
    const relationType =
      row.relation_type === "start_here" ||
      row.relation_type === "next" ||
      row.relation_type === "previous"
        ? row.relation_type
        : "related";

    return resource
      ? [
          {
            resource,
            relation_type: relationType,
            display_order:
              typeof row.display_order === "number" ? row.display_order : 100,
          },
        ]
      : [];
  });
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
    ? prerenderSnapshot
        .filter(
          (resource) =>
            resource.resource_kind === "article" &&
            resource.category_slug === categorySlug,
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
    queryKey: [
      "website-resource-article",
      WEBSITE_RESOURCE_TENANT_ID,
      categorySlug,
      articleSlug,
    ],
    queryFn: () => fetchPublishedArticle(categorySlug as string, articleSlug as string),
    enabled: Boolean(categorySlug && articleSlug),
    initialData: seed,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function usePublishedFeaturedArticles() {
  const seed = prerenderSnapshot
    .filter((resource) => resource.resource_kind === "article" && resource.featured)
    .sort(
      (a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title),
    )
    .slice(0, 6);

  return useQuery({
    queryKey: ["website-resource-featured", WEBSITE_RESOURCE_TENANT_ID],
    queryFn: fetchPublishedFeaturedArticles,
    initialData: seed.length > 0 ? seed : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function usePublicResourceSources(resourceId: string | undefined) {
  return useQuery({
    queryKey: ["website-resource-sources", WEBSITE_RESOURCE_TENANT_ID, resourceId],
    queryFn: () => fetchPublicResourceSources(resourceId as string),
    enabled: Boolean(resourceId),
    staleTime: 60_000,
  });
}

export function useRelatedResources(resourceId: string | undefined) {
  return useQuery({
    queryKey: ["website-resource-relations", WEBSITE_RESOURCE_TENANT_ID, resourceId],
    queryFn: () => fetchRelatedResources(resourceId as string),
    enabled: Boolean(resourceId),
    staleTime: 60_000,
  });
}

/** Build/prerender only. Never use to decide what a browser user sees. */
export function getPrerenderResources(): WebsiteResource[] {
  return prerenderSnapshot;
}
