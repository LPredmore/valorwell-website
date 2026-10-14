import { useQuery } from "@tanstack/react-query";
import { billingHubSupabase } from "@/integrations/supabase/client";
import {
  generatedResourceGroups,
  generatedWebsiteResources,
} from "@/generated/websiteResources";

export const WEBSITE_RESOURCE_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export type WebsiteResourceFaq = {
  question: string;
  answer: string;
};

export type WebsiteResourceKind = "category" | "article";

export type WebsiteResourceCta = "find_care" | "join_network" | "support_foundation";

export type WebsiteResourceSource = {
  title: string;
  url: string;
  organization: string | null;
};

export type WebsiteResourceGroup = {
  category_slug: string;
  group_slug: string;
  name: string;
  display_order: number;
  intro: string | null;
};

export type WebsiteResource = {
  id: string | null;
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
  public_updated_at: string | null;
  resource_kind: WebsiteResourceKind;
  category_slug: string | null;
  sort_order: number;
  quick_answer: string | null;
  in_practice_markdown: string | null;
  reviewed_by: string;
  last_reviewed_on: string | null;
  cta: WebsiteResourceCta;
  group_slug: string | null;
};

/** Sources and related pages for one article. */
export type WebsiteResourceExtras = {
  sources: WebsiteResourceSource[];
  related: WebsiteResource[];
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
  "published_at",
  "public_updated_at",
  "resource_kind",
  "category_slug",
  "sort_order",
  "quick_answer",
  "in_practice_markdown",
  "reviewed_by",
  "last_reviewed_on",
  "cta",
  "group_slug",
].join(",");

const CTAS: WebsiteResourceCta[] = ["find_care", "join_network", "support_foundation"];

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

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

export function normalizeResource(row: Record<string, unknown>): WebsiteResource | null {
  if (typeof row.slug !== "string" || !row.slug.trim()) return null;
  if (typeof row.title !== "string" || !row.title.trim()) return null;

  if (row.resource_kind !== "article" && row.resource_kind !== "category") return null;
  const kind: WebsiteResourceKind = row.resource_kind;

  return {
    id: text(row.id),
    slug: row.slug,
    title: row.title,
    primary_question: typeof row.primary_question === "string" ? row.primary_question : "",
    summary: typeof row.summary === "string" ? row.summary : "",
    body_markdown: typeof row.body_markdown === "string" ? row.body_markdown : "",
    faq: normalizeFaq(row.faq),
    audience_tags: normalizeStringArray(row.audience_tags),
    topic_aliases: normalizeStringArray(row.topic_aliases),
    status: "published",
    published_at: text(row.published_at),
    public_updated_at: text(row.public_updated_at),
    resource_kind: kind,
    category_slug: typeof row.category_slug === "string" ? row.category_slug : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 100,
    quick_answer: text(row.quick_answer),
    in_practice_markdown: text(row.in_practice_markdown),
    reviewed_by: text(row.reviewed_by) ?? "ValorWell",
    last_reviewed_on: text(row.last_reviewed_on),
    cta: CTAS.includes(row.cta as WebsiteResourceCta) ? (row.cta as WebsiteResourceCta) : "find_care",
    group_slug: text(row.group_slug),
  };
}

function normalizeSources(value: unknown): WebsiteResourceSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const url = text(row.url);
    const title = text(row.title);
    if (!url || !title || !/^https?:\/\//.test(url)) return [];
    return [{ title, url, organization: text(row.organization) }];
  });
}

function normalizeGroups(value: unknown): WebsiteResourceGroup[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const categorySlug = text(row.category_slug);
    const groupSlug = text(row.group_slug);
    const name = text(row.name);
    if (!categorySlug || !groupSlug || !name) return [];
    return [
      {
        category_slug: categorySlug,
        group_slug: groupSlug,
        name,
        display_order: typeof row.display_order === "number" ? row.display_order : 100,
        intro: text(row.intro),
      },
    ];
  });
}

/** Articles sort by their position in the sheet, then by title. */
export function compareArticles(a: WebsiteResource, b: WebsiteResource): number {
  return a.sort_order - b.sort_order || a.title.localeCompare(b.title);
}

/**
 * Build/prerender-time snapshot. Used only to seed server-rendered HTML so SEO
 * snapshots are not blank; runtime Supabase data always supersedes it.
 */
type SnapshotRow = Record<string, unknown> & {
  sources?: unknown;
  related?: unknown;
};

const snapshotRows = generatedWebsiteResources as unknown as SnapshotRow[];

const prerenderSnapshot: WebsiteResource[] = snapshotRows
  .map(normalizeResource)
  .filter((resource): resource is WebsiteResource => resource !== null);

const snapshotGroups = normalizeGroups(generatedResourceGroups);

function articleKey(resource: Pick<WebsiteResource, "category_slug" | "slug">): string {
  return `${resource.category_slug}/${resource.slug}`;
}

function snapshotExtras(resource: WebsiteResource): WebsiteResourceExtras | undefined {
  const row = snapshotRows.find(
    (candidate) =>
      candidate.resource_kind === "article" &&
      candidate.category_slug === resource.category_slug &&
      candidate.slug === resource.slug,
  );
  if (!row) return undefined;
  const relatedKeys = normalizeStringArray(row.related);
  const byKey = new Map(
    prerenderSnapshot
      .filter((candidate) => candidate.resource_kind === "article")
      .map((candidate) => [articleKey(candidate), candidate]),
  );
  return {
    sources: normalizeSources(row.sources),
    related: relatedKeys.flatMap((key) => (byKey.has(key) ? [byKey.get(key) as WebsiteResource] : [])),
  };
}

function baseQuery() {
  return billingHubSupabase
    .from("website_resources_public")
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

export async function fetchPublishedArticlesByCategory(
  categorySlug: string,
): Promise<WebsiteResource[]> {
  const { data, error } = await baseQuery()
    .eq("resource_kind", "article")
    .eq("category_slug", categorySlug)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return normalizeMany(data)
    .filter(
      (resource) =>
        resource.resource_kind === "article" && resource.category_slug === categorySlug,
    )
    .sort(compareArticles);
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

export async function fetchCategoryGroups(categorySlug: string): Promise<WebsiteResourceGroup[]> {
  const { data, error } = await billingHubSupabase
    .from("website_resource_groups")
    .select("category_slug,group_slug,name,display_order,intro")
    .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
    .eq("category_slug", categorySlug)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return normalizeGroups(data)
    .filter((group) => group.category_slug === categorySlug)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function fetchArticleExtras(resourceId: string): Promise<WebsiteResourceExtras> {
  const [sourcesResult, relationsResult] = await Promise.all([
    billingHubSupabase
      .from("website_resource_sources")
      .select("title,url,organization,display_order")
      .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
      .eq("resource_id", resourceId)
      .order("display_order", { ascending: true }),
    billingHubSupabase
      .from("website_resource_relations")
      .select("related_resource_id,display_order")
      .eq("tenant_id", WEBSITE_RESOURCE_TENANT_ID)
      .eq("resource_id", resourceId)
      .eq("relation_type", "related")
      .order("display_order", { ascending: true }),
  ]);

  if (sourcesResult.error) throw sourcesResult.error;
  if (relationsResult.error) throw relationsResult.error;

  const relatedIds = ((relationsResult.data ?? []) as Record<string, unknown>[]).flatMap((row) =>
    typeof row.related_resource_id === "string" ? [row.related_resource_id] : [],
  );

  let related: WebsiteResource[] = [];
  if (relatedIds.length > 0) {
    const { data, error } = await baseQuery()
      .eq("resource_kind", "article")
      .in("id", relatedIds);
    if (error) throw error;
    const byId = new Map(normalizeMany(data).map((resource) => [resource.id, resource]));
    related = relatedIds.flatMap((id) => (byId.has(id) ? [byId.get(id) as WebsiteResource] : []));
  }

  return { sources: normalizeSources(sourcesResult.data), related };
}

export function usePublishedCategories() {
  const seed = prerenderSnapshot
    .filter((resource) => resource.resource_kind === "category")
    .sort(compareArticles);

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
            resource.resource_kind === "article" && resource.category_slug === categorySlug,
        )
        .sort(compareArticles)
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

export function useCategoryGroups(categorySlug: string | undefined) {
  const seed = categorySlug
    ? snapshotGroups.filter((group) => group.category_slug === categorySlug)
    : [];

  return useQuery({
    queryKey: ["website-resource-groups", WEBSITE_RESOURCE_TENANT_ID, categorySlug],
    queryFn: () => fetchCategoryGroups(categorySlug as string),
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

export function useArticleExtras(resource: WebsiteResource | null | undefined) {
  const seed = resource ? snapshotExtras(resource) : undefined;

  return useQuery({
    queryKey: ["website-resource-extras", WEBSITE_RESOURCE_TENANT_ID, resource?.id],
    queryFn: () => fetchArticleExtras(resource?.id as string),
    enabled: Boolean(resource?.id),
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
