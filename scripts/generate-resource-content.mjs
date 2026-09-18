import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const ROOT = process.cwd();
const env = loadEnv(process.env.NODE_ENV || "production", ROOT, "VITE_");
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  throw new Error(
    "Resource generation requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

const headers = {
  apikey: publishableKey,
  Authorization: `Bearer ${publishableKey}`,
  Accept: "application/json",
};

async function fetchTable(table, select, params = {}) {
  const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
  endpoint.searchParams.set("select", select);
  endpoint.searchParams.set("tenant_id", `eq.${TENANT_ID}`);

  for (const [key, value] of Object.entries(params)) {
    endpoint.searchParams.set(key, value);
  }

  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Could not generate resource data from ${table} (${response.status}): ${body.slice(0, 300)}`,
    );
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`${table} returned an invalid array payload.`);
  }

  return data;
}

const rows = await fetchTable(
  "website_resources_public",
  [
    "id",
    "tenant_id",
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
  ].join(","),
  {
    status: "eq.published",
    order: "resource_kind.asc,sort_order.asc,title.asc",
  },
);

const sources = await fetchTable(
  "website_resource_sources",
  [
    "id",
    "resource_id",
    "citation_key",
    "organization",
    "title",
    "url",
    "source_type",
    "source_published_at",
    "verified_at",
    "display_order",
  ].join(","),
  {
    is_public: "eq.true",
    order: "resource_id.asc,display_order.asc",
  },
);

const relations = await fetchTable(
  "website_resource_relations",
  "resource_id,related_resource_id,relation_type,display_order",
  {
    order: "resource_id.asc,display_order.asc",
  },
);

function requireString(row, field) {
  if (typeof row[field] !== "string" || !row[field].trim()) {
    throw new Error(`Published resource is missing ${field}.`);
  }
}

for (const row of rows) {
  for (const field of [
    "id",
    "tenant_id",
    "slug",
    "title",
    "primary_question",
    "summary",
    "body_markdown",
    "status",
    "resource_kind",
    "editorial_type",
  ]) {
    requireString(row, field);
  }

  for (const field of ["faq", "audience_tags", "topic_aliases"]) {
    if (!Array.isArray(row[field])) {
      throw new Error(`Published resource ${row.slug} has invalid ${field}.`);
    }
  }

  if (row.status !== "published") {
    throw new Error(`Non-published resource ${row.slug} reached the public build.`);
  }

  if (!Number.isInteger(row.content_schema_version)) {
    throw new Error(`Published resource ${row.slug} has invalid content_schema_version.`);
  }

  if (!Number.isInteger(row.sort_order)) {
    throw new Error(`Published resource ${row.slug} has invalid sort_order.`);
  }

  if (typeof row.featured !== "boolean") {
    throw new Error(`Published resource ${row.slug} has invalid featured flag.`);
  }

  if (row.resource_kind === "article" && !row.category_slug) {
    throw new Error(`Published article ${row.slug} is missing category_slug.`);
  }
}

const uniqueSlugs = new Set(rows.map((row) => row.slug));
if (uniqueSlugs.size !== rows.length) {
  throw new Error("Published website resources contain duplicate slugs.");
}

const publicIds = new Set(rows.map((row) => row.id));

for (const source of sources) {
  if (!publicIds.has(source.resource_id)) {
    throw new Error(
      `Public source ${source.citation_key || source.id} references a non-public resource.`,
    );
  }
}

for (const relation of relations) {
  if (!publicIds.has(relation.resource_id) || !publicIds.has(relation.related_resource_id)) {
    throw new Error("Public resource relation references a non-public resource.");
  }
}

const tsHeader = `// Generated from Billing Hub public resource views. Do not edit by hand.
// scripts/generate-resource-content.mjs refreshes this file before production builds.

export type GeneratedWebsiteResource = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  primary_question: string;
  summary: string;
  body_markdown: string;
  faq: unknown[];
  audience_tags: string[];
  topic_aliases: string[];
  status: "published";
  live_url: string | null;
  published_at: string | null;
  resource_kind: "category" | "article";
  category_slug: string | null;
  content_schema_version: number;
  editorial_type: "category" | "guide" | "explainer" | "checklist" | "reference";
  featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  public_updated_at: string | null;
};

export type GeneratedWebsiteResourceSource = {
  id: string;
  resource_id: string;
  citation_key: string;
  organization: string | null;
  title: string | null;
  url: string;
  source_type: "official" | "statute" | "regulation" | "policy" | "clinical" | "research" | "other";
  source_published_at: string | null;
  verified_at: string | null;
  display_order: number;
};

export type GeneratedWebsiteResourceRelation = {
  resource_id: string;
  related_resource_id: string;
  relation_type: "related" | "start_here" | "next" | "previous";
  display_order: number;
};

`;

const resourceModule =
  `${tsHeader}export const generatedWebsiteResources: GeneratedWebsiteResource[] = ${JSON.stringify(rows, null, 2)};\n\n` +
  `export const generatedWebsiteResourceSources: GeneratedWebsiteResourceSource[] = ${JSON.stringify(sources, null, 2)};\n\n` +
  `export const generatedWebsiteResourceRelations: GeneratedWebsiteResourceRelation[] = ${JSON.stringify(relations, null, 2)};\n`;

const routeRows = rows.map((row) => ({
  path:
    row.resource_kind === "article"
      ? `/resources/${row.category_slug}/${row.slug}`
      : `/resources/${row.slug}`,
  title: `${row.seo_title || row.title} | ValorWell`,
  description: row.seo_description || row.summary,
  h1: row.title,
  lead: row.summary,
  indexable: true,
  sitemap: true,
  lastmod: row.public_updated_at || row.published_at || null,
}));

const routeModule = `// Generated from public.website_resources_public. Do not edit by hand.
// scripts/generate-resource-content.mjs refreshes this file before production builds.

export const generatedResourceRoutes = ${JSON.stringify(routeRows, null, 2)};
`;

const resourceOutput = path.join(ROOT, "src", "generated", "websiteResources.ts");
const routeOutput = path.join(ROOT, "route-contract", "generated-resource-routes.mjs");
fs.mkdirSync(path.dirname(resourceOutput), { recursive: true });
fs.writeFileSync(resourceOutput, resourceModule, "utf8");
fs.writeFileSync(routeOutput, routeModule, "utf8");

console.log(
  `Generated ${rows.length} published resources, ${sources.length} public sources, and ${relations.length} curated relations from Billing Hub.`,
);
