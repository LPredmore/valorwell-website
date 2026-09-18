import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";
import { validateResourceMarkup } from "./resource-content-rules.mjs";

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

async function fetchRows(table, select, params = {}) {
  const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
  endpoint.searchParams.set("select", select);
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

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    throw new Error(`${table} returned an invalid payload.`);
  }
  return rows;
}

const rows = await fetchRows(
  "website_resources",
  [
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
  ].join(","),
  {
    tenant_id: `eq.${TENANT_ID}`,
    status: "eq.published",
    order: "sort_order.asc,title.asc",
  },
);

const sources = await fetchRows(
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
    "is_public",
    "display_order",
  ].join(","),
  {
    tenant_id: `eq.${TENANT_ID}`,
    is_public: "eq.true",
    order: "resource_id.asc,display_order.asc,citation_key.asc",
  },
);

const relations = await fetchRows(
  "website_resource_relations",
  [
    "resource_id",
    "related_resource_id",
    "relation_type",
    "display_order",
  ].join(","),
  {
    tenant_id: `eq.${TENANT_ID}`,
    order: "resource_id.asc,display_order.asc",
  },
);

function requireString(row, field) {
  if (typeof row[field] !== "string" || !row[field].trim()) {
    throw new Error(`Published resource is missing ${field}.`);
  }
}

const resourceIds = new Set();
const resourceSlugs = new Set();
const categorySlugs = new Set(
  rows
    .filter((row) => row.resource_kind === "category")
    .map((row) => row.slug),
);

for (const row of rows) {
  for (const field of [
    "id",
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

  if (!Array.isArray(row.faq)) {
    throw new Error(`Published resource ${row.slug} has invalid faq.`);
  }
  for (const field of ["audience_tags", "topic_aliases"]) {
    if (!Array.isArray(row[field])) {
      throw new Error(`Published resource ${row.slug} has invalid ${field}.`);
    }
  }

  if (row.status !== "published") {
    throw new Error(`Non-published resource ${row.slug} reached the public build.`);
  }
  if (!["category", "article"].includes(row.resource_kind)) {
    throw new Error(`Published resource ${row.slug} has invalid resource_kind.`);
  }
  if (!["category", "guide", "explainer", "checklist", "reference"].includes(row.editorial_type)) {
    throw new Error(`Published resource ${row.slug} has invalid editorial_type.`);
  }
  if (row.resource_kind === "category" && row.editorial_type !== "category") {
    throw new Error(`Published category ${row.slug} must use editorial_type=category.`);
  }
  if (row.resource_kind === "article") {
    if (!row.category_slug || !categorySlugs.has(row.category_slug)) {
      throw new Error(
        `Published article ${row.slug} references missing category ${row.category_slug ?? "(none)"}.`,
      );
    }
    if (row.editorial_type === "category") {
      throw new Error(`Published article ${row.slug} cannot use editorial_type=category.`);
    }
  }

  const validation = validateResourceMarkup(row.body_markdown);
  if (validation.errors.length > 0) {
    throw new Error(
      `Published resource ${row.slug} has invalid Markdoc content:\n- ${validation.errors.join("\n- ")}`,
    );
  }

  resourceIds.add(row.id);
  if (resourceSlugs.has(row.slug)) {
    throw new Error(`Published website resources contain duplicate slug ${row.slug}.`);
  }
  resourceSlugs.add(row.slug);
}

for (const source of sources) {
  for (const field of ["id", "resource_id", "citation_key", "url", "source_type"]) {
    requireString(source, field);
  }
  if (!resourceIds.has(source.resource_id)) {
    throw new Error(
      `Public source ${source.citation_key} points to a resource that is not published.`,
    );
  }
}

for (const relation of relations) {
  for (const field of ["resource_id", "related_resource_id", "relation_type"]) {
    requireString(relation, field);
  }
  if (!resourceIds.has(relation.resource_id) || !resourceIds.has(relation.related_resource_id)) {
    throw new Error("Public resource relation points to a resource that is not published.");
  }
}

const tsHeader = `// Generated from Billing Hub public resource data. Do not edit by hand.
// scripts/generate-resource-content.mjs refreshes this file before production builds.

export type GeneratedWebsiteResource = {
  id: string;
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
  is_public: boolean;
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
  tsHeader +
  `export const generatedWebsiteResources: GeneratedWebsiteResource[] = ${JSON.stringify(rows, null, 2)};\n\n` +
  `export const generatedWebsiteResourceSources: GeneratedWebsiteResourceSource[] = ${JSON.stringify(sources, null, 2)};\n\n` +
  `export const generatedWebsiteResourceRelations: GeneratedWebsiteResourceRelation[] = ${JSON.stringify(relations, null, 2)};\n`;

const routeRows = rows.map((row) => ({
  path:
    row.resource_kind === "article"
      ? `/resources/${row.category_slug}/${row.slug}`
      : `/resources/${row.slug}`,
  title: row.seo_title?.trim() || `${row.title} | ValorWell`,
  description: row.seo_description?.trim() || row.summary,
  h1: row.title,
  lead: row.summary,
  indexable: true,
  sitemap: true,
  lastmod: row.public_updated_at || row.published_at || null,
}));

const routeModule = `// Generated from public.website_resources. Do not edit by hand.
// scripts/generate-resource-content.mjs refreshes this file before production builds.

export const generatedResourceRoutes = ${JSON.stringify(routeRows, null, 2)};
`;

const resourceOutput = path.join(ROOT, "src", "generated", "websiteResources.ts");
const routeOutput = path.join(ROOT, "route-contract", "generated-resource-routes.mjs");
fs.mkdirSync(path.dirname(resourceOutput), { recursive: true });
fs.writeFileSync(resourceOutput, resourceModule, "utf8");
fs.writeFileSync(routeOutput, routeModule, "utf8");

console.log(
  `Generated ${rows.length} published resources, ${sources.length} public sources, and ${relations.length} explicit relations from Billing Hub.`,
);
