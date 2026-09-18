import { useQuery } from "@tanstack/react-query";
import { billingHubSupabase } from "@/integrations/supabase/client";
import {
  generatedWebsiteResources,
  generatedWebsiteResourceRelations,
  generatedWebsiteResourceSources,
} from "@/generated/websiteResources";
import {
  publicWebsiteResourceSchema,
  websiteResourceRelationSchema,
  websiteResourceSourceSchema,
  type WebsiteResource,
  type WebsiteResourceRelation,
  type WebsiteResourceSource,
} from "@/content/resourceSchema";

export const WEBSITE_RESOURCE_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type {
  WebsiteResource,
  WebsiteResourceFaq,
  WebsiteResourceKind,
  WebsiteResourceRelation,
  WebsiteResourceSource,
} from "@/content/resourceSchema";

export type WebsiteResourceRelationWithResource = WebsiteResourceRelation & {
  resource: WebsiteResource;
};

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
  "live_url",
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

const SOURCE_COLUMNS = [
  "id",
  "resource_id",
  "citation_key",
  "organization",
  "title",
  "url",
  "source_type",
  "source_published_at",
  "verified_at",
  "is_public",
  "display_order",
].join(",");

const RELATION_COLUMNS = [
  "resource_id",
  "related_resource_id",
  "relation_type",
  "display_order",
].join(",");

function normalizeResource(row: Record<string, unknown>): WebsiteResource | null {
  const parsed = publicWebsiteResourceSchema.safeParse({
    content_schema_version: 1,
    editorial_type: row.resource_kind === "category" ? "category" : "guide",
    featured: false,
    sort_order: 100,
    seo_title: null,
    seo_description: null,
    public_updated_at: null,
    ...row,
  });

  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.warn("Ignoring invalid published website resource", parsed.error.flatten());
    }
    return null;
  }

  if (
    parsed.data.resource_kind === "article" &&
    (!parsed.data.category_slug || parsed.data.editorial_type === "category")
  ) {
    return null;
  }

  return parsed.data;
}

function normalizeSource(row: Record<string, unknown>): WebsiteResourceSource | null {
  const parsed = websiteResourceSourceSchema.safeParse(row);
  return parsed.success ? parsed.data : null;
}

function normalizeRelation(row: Record<string, unknown>): WebsiteResourceRelation | null {
  const parsed = websiteResourceRelationSchema.safeParse(row);
  return parsed.success ? parsed.data : null;
}

function normalizeMany(data: unknown): WebsiteResource[] {
  return ((data ?? []) as unknown as Record<string, unknown>[])
    .map(normalizeResource)
    .filter((resource): resource is WebsiteResource => resource !== null);
}

/**
 * Build/prerender snapshot. Runtime Supabase data remains authoritative.
 * Older generated snapshots are tolerated so local development does not fail
 * before the next resource generation step.
 */
const prerenderSnapshot: WebsiteResource[] = (
  generatedWebsiteResources as unknown as Record<string, unknown>[]
)
  .map(normalizeResource)
  .filter((resource): resource is WebsiteResource => resource !== null);

const prerenderSources: WebsiteResourceSource[] = (
  generatedWebsiteResourceSources as unknown as Record<string, unknown>[]
)
  .map(normalizeSource)
  .filter((source): source is WebsiteResourceSource => source !== null);

const prerenderRelations: WebsiteResourceRelation[] = (
  generatedWebsiteResourceRelations as unknown as Record<string, unknown>[]
)
  .map(normalizeRelation)
  .filter((relation): relation is WebsiteResourceRelation => relation !== null);

function baseQuery() {
  return billingHubSupabase
    .from("website_resources")
    .select(RESOURCE_COLUMNS)
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("status", "published");
}

function sortResources(resources: WebsiteResource[]): WebsiteResource[] {
  return [...resources].sort(
    (a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title),
  );
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

  const resource = normalizeResource(data as unknown as Record<string, unknown>);
  return resource && resource.resource_kind === "category" ? resource : null;
}

export async function fetchPublishedArticles(): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "article")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return normalizeMany(data).filter((resource) => resource.resource_kind === "article");
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

  const resource = normalizeResource(data as unknown as Record<string, unknown>);
  return resource &&
    resource.resource_kind === "article" &&
    resource.category_slug === categorySlug &&
    resource.slug === articleSlug
    ? resource
    : null;
}

export async function fetchPublishedResourceSources(
  resourceId: string,
): Promise<WebsiteResourceSource[]> {
  const { data, error } = await billingHubSupabase
    .from("website_resource_sources")
    .select(SOURCE_COLUMNS)
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("resource_id", resourceId)
    .eq("is_public", true)
    .order("display_order", { ascending: true })
    .order("citation_key", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as Record<string, unknown>[])
    .map(normalizeSource)
    .filter((source): source is WebsiteResourceSource => source !== null);
}

export async function fetchPublishedResourceRelations(
  resourceId: string,
): Promise<WebsiteResourceRelationWithResource[]> {
  const { data: relationRows, error: relationError } = await billingHubSupabase
    .from("website_resource_relations")
    .select(RELATION_COLUMNS)
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("resource_id", resourceId)
    .order("display_order", { ascending: true });

  if (relationError) throw relationError;

  const relations = ((relationRows ?? []) as unknown as Record<string, unknown>[])
    .map(normalizeRelation)
    .filter((relation): relation is WebsiteResourceRelation => relation !== null);

  if (relations.length === 0) return [];

  const targetIds = [...new Set(relations.map((relation) => relation.related_resource_id))];
  const { data: targetRows, error: targetError } = await baseQuery().in("id", targetIds);

  if (targetError) throw targetError;

  const targets = new Map(
    normalizeMany(targetRows).map((resource) => [resource.id, resource] as const),
  );

  return relations.flatMap((relation) => {
    const resource = targets.get(relation.related_resource_id);
    return resource ? [{ ...relation, resource }] : [];
  });
}

export function usePublishedCategories() {
  const seed = sortResources(
    prerenderSnapshot.filter((resource) => resource.resource_kind === "category"),
  );

  return useQuery({
    queryKey: ["website-resource-categories", WEBSITE_RESOURCE_TENANT_ID],
    queryFn: fetchPublishedCategories,
    initialData: seed.length > 0 ? seed : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
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
    staleTime: 60_000,
    refetchOnMount: "always",
  });
}

export function usePublishedArticles() {
  const seed = sortResources(
    prerenderSnapshot.filter((resource) => resource.resource_kind === "article"),
  );

  return useQuery({
    queryKey: ["website-resource-articles", WEBSITE_RESOURCE_TENANT_ID],
    queryFn: fetchPublishedArticles,
    initialData: seed.length > 0 ? seed : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
    refetchOnMount: "always",
  });
}

export function usePublishedCategoryArticles(categorySlug: string | undefined) {
  const seed = categorySlug
    ? sortResources(
        prerenderSnapshot.filter(
          (resource) =>
            resource.resource_kind === "article" && resource.category_slug === categorySlug,
        ),
      )
    : [];

  return useQuery({
    queryKey: ["website-resource-articles", WEBSITE_RESOURCE_TENANT_ID, categorySlug],
    queryFn: () => fetchPublishedArticlesByCategory(categorySlug as string),
    enabled: Boolean(categorySlug),
    initialData: seed.length > 0 ? seed : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
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
    staleTime: 60_000,
    refetchOnMount: "always",
  });
}

export function usePublishedResourceSources(resourceId: string | undefined) {
  const seed = resourceId
    ? prerenderSources
        .filter((source) => source.resource_id === resourceId)
        .sort((a, b) => a.display_order - b.display_order)
    : [];

  return useQuery({
    queryKey: ["website-resource-sources", WEBSITE_RESOURCE_TENANT_ID, resourceId],
    queryFn: () => fetchPublishedResourceSources(resourceId as string),
    enabled: Boolean(resourceId),
    initialData: seed.length > 0 ? seed : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });
}

export function usePublishedResourceRelations(resourceId: string | undefined) {
  const resourceMap = new Map(prerenderSnapshot.map((resource) => [resource.id, resource] as const));
  const seed = resourceId
    ? prerenderRelations
        .filter((relation) => relation.resource_id === resourceId)
        .sort((a, b) => a.display_order - b.display_order)
        .flatMap((relation) => {
          const resource = resourceMap.get(relation.related_resource_id);
          return resource ? [{ ...relation, resource }] : [];
        })
    : [];

  return useQuery({
    queryKey: ["website-resource-relations", WEBSITE_RESOURCE_TENANT_ID, resourceId],
    queryFn: () => fetchPublishedResourceRelations(resourceId as string),
    enabled: Boolean(resourceId),
    initialData: seed.length > 0 ? seed : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });
}

/** Build/prerender only. Never use to decide what a browser user sees. */
export function getPrerenderResources(): WebsiteResource[] {
  return prerenderSnapshot;
}
