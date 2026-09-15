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

const endpoint = new URL("/rest/v1/website_resources", supabaseUrl);
endpoint.searchParams.set(
  "select",
  [
    "slug",
    "title",
    "primary_question",
    "summary",
    "body_markdown",
    "faq",
    "audience_tags",
    "topic_aliases",
    "source_urls",
    "coverage_status",
    "status",
    "live_url",
    "last_researched_at",
    "published_at",
  ].join(","),
);
endpoint.searchParams.set("tenant_id", `eq.${TENANT_ID}`);
endpoint.searchParams.set("status", "eq.published");
endpoint.searchParams.set("order", "title.asc");

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
  throw new Error("Billing Hub returned an invalid website_resources payload.");
}

function requireString(row, field) {
  if (typeof row[field] !== "string" || !row[field].trim()) {
    throw new Error(`Published resource is missing ${field}.`);
  }
}

for (const row of rows) {
  for (const field of [
    "slug",
    "title",
    "primary_question",
    "summary",
    "body_markdown",
    "coverage_status",
    "status",
  ]) {
    requireString(row, field);
  }

  for (const field of ["faq", "audience_tags", "topic_aliases", "source_urls"]) {
    if (!Array.isArray(row[field])) {
      throw new Error(`Published resource ${row.slug} has invalid ${field}.`);
    }
  }

  if (row.status !== "published") {
    throw new Error(`Non-published resource ${row.slug} reached the public build.`);
  }
}

const uniqueSlugs = new Set(rows.map((row) => row.slug));
if (uniqueSlugs.size !== rows.length) {
  throw new Error("Published website resources contain duplicate slugs.");
}

const tsHeader = `// Generated from public.website_resources. Do not edit by hand.\n// scripts/generate-resource-content.mjs refreshes this file before production builds.\n\nexport type GeneratedWebsiteResource = {\n  slug: string;\n  title: string;\n  primary_question: string;\n  summary: string;\n  body_markdown: string;\n  faq: unknown[];\n  audience_tags: string[];\n  topic_aliases: string[];\n  source_urls: string[];\n  coverage_status: \"partial\" | \"complete\" | \"needs_review\";\n  status: \"published\";\n  live_url: string | null;\n  last_researched_at: string | null;\n  published_at: string | null;\n};\n\n`;

const resourceModule = `${tsHeader}export const generatedWebsiteResources: GeneratedWebsiteResource[] = ${JSON.stringify(rows, null, 2)};\n`;
const routeRows = rows.map((row) => ({
  path: `/resources/${row.slug}`,
  title: `${row.title} | ValorWell`,
  description: row.summary,
  h1: row.title,
  lead: row.summary,
  indexable: true,
  sitemap: true,
}));
const routeModule = `// Generated from public.website_resources. Do not edit by hand.\n// scripts/generate-resource-content.mjs refreshes this file before production builds.\n\nexport const generatedResourceRoutes = ${JSON.stringify(routeRows, null, 2)};\n`;

const resourceOutput = path.join(ROOT, "src", "generated", "websiteResources.ts");
const routeOutput = path.join(ROOT, "route-contract", "generated-resource-routes.mjs");
fs.mkdirSync(path.dirname(resourceOutput), { recursive: true });
fs.writeFileSync(resourceOutput, resourceModule, "utf8");
fs.writeFileSync(routeOutput, routeModule, "utf8");

console.log(`Generated ${rows.length} published website resources from Billing Hub.`);
