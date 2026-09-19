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

const PUBLIC_RESOURCE_FIELDS = [
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
];

const endpoint = new URL("/rest/v1/website_resources_public", supabaseUrl);
endpoint.searchParams.set("select", PUBLIC_RESOURCE_FIELDS.join(","));
endpoint.searchParams.set("tenant_id", `eq.${TENANT_ID}`);
endpoint.searchParams.set("status", "eq.published");
endpoint.searchParams.set("order", "sort_order.asc,title.asc");

const response = await fetch(endpoint, {
  headers: {
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
    Accept: "application/json",
  },
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(
    `Could not generate website resources from Billing Hub (${response.status}): ${body.slice(0, 300)}`,
  );
}

const rows = await response.json();
if (!Array.isArray(rows)) {
  throw new Error("Billing Hub returned an invalid website_resources_public payload.");
}

function requireString(row, field) {
  if (typeof row[field] !== "string" || !row[field].trim()) {
    throw new Error(`Published resource is missing ${field}.`);
  }
}

for (const row of rows) {
  for (const field of [
    "id",
    "slug",
    "title",
    "primary_question",
    "summary",
    "body_markdown",
    "status",
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

  if (!Number.isInteger(row.content_schema_version) || row.content_schema_version < 1) {
    throw new Error(
      `Published resource ${row.slug} has invalid content_schema_version.`,
    );
  }

  if (typeof row.featured !== "boolean" || !Number.isInteger(row.sort_order)) {
    throw new Error(`Published resource ${row.slug} has invalid editorial metadata.`);
  }
}

for (const row of rows) {
  const kind = row.resource_kind === "article" ? "article" : "category";
  row.resource_kind = kind;
  row.category_slug = typeof row.category_slug === "string" ? row.category_slug : null;

  if (kind === "article" && !row.category_slug) {
    throw new Error(`Published article ${row.slug} is missing category_slug.`);
  }
}

const uniqueIds = new Set(rows.map((row) => row.id));
if (uniqueIds.size !== rows.length) {
  throw new Error("Published website resources contain duplicate IDs.");
}

const uniqueSlugs = new Set(rows.map((row) => row.slug));
if (uniqueSlugs.size !== rows.length) {
  throw new Error("Published website resources contain duplicate slugs.");
}

const categorySlugs = new Set(
  rows
    .filter((row) => row.resource_kind === "category")
    .map((row) => row.slug),
);

for (const row of rows) {
  if (
    row.resource_kind === "article" &&
    !categorySlugs.has(row.category_slug)
  ) {
    throw new Error(
      `Published article ${row.slug} references missing category ${row.category_slug}.`,
    );
  }
}

const tsHeader = `// Generated from public.website_resources_public. Do not edit by hand.
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

`;

const resourceModule =
  `${tsHeader}export const generatedWebsiteResources: GeneratedWebsiteResource[] = ${JSON.stringify(rows, null, 2)};\n`;

const routeRows = rows.map((row) => ({
  path:
    row.resource_kind === "article"
      ? `/resources/${row.category_slug}/${row.slug}`
      : `/resources/${row.slug}`,
  title: row.seo_title || `${row.title} | ValorWell`,
  description: row.seo_description || row.summary,
  h1: row.title,
  lead: row.summary,
  indexable: true,
  sitemap: true,
  lastModified: row.public_updated_at || row.published_at || null,
}));

const routeModule = `// Generated from public.website_resources_public. Do not edit by hand.
// scripts/generate-resource-content.mjs refreshes this file before production builds.

export const generatedResourceRoutes = ${JSON.stringify(routeRows, null, 2)};\n`;

const resourceOutput = path.join(ROOT, "src", "generated", "websiteResources.ts");
const jsonOutput = path.join(ROOT, "src", "generated", "websiteResources.json");
const routeOutput = path.join(ROOT, "route-contract", "generated-resource-routes.mjs");

fs.mkdirSync(path.dirname(resourceOutput), { recursive: true });
fs.writeFileSync(resourceOutput, resourceModule, "utf8");
fs.writeFileSync(jsonOutput, JSON.stringify(rows, null, 2) + "\n", "utf8");
fs.writeFileSync(routeOutput, routeModule, "utf8");

console.log(`Generated ${rows.length} published website resources from Billing Hub.`);
