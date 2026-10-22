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

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504, 520, 522, 524, 544]);
const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000];
const REQUEST_TIMEOUT_MS = 30000;

// Billing Hub is shared; short outages (502/503/504, timeouts) are retried with
// backoff. A persistent failure still fails the build so no page set ships incomplete.
export async function fetchWithRetry(url, init, { delays = RETRY_DELAYS_MS, timeoutMs = REQUEST_TIMEOUT_MS, fetchImpl = fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      const res = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (!RETRYABLE_STATUS.has(res.status) || attempt === delays.length) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
      if (attempt === delays.length) throw new Error(`Billing Hub unreachable after ${attempt + 1} attempts: ${err?.message ?? err}`);
    }
    console.warn(`Billing Hub request failed (${lastError.message}); retry ${attempt + 1}/${delays.length} in ${delays[attempt] / 1000}s`);
    await sleep(delays[attempt]);
  }
  throw lastError;
}

const endpoint = new URL("/rest/v1/website_resources_public", supabaseUrl);
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
    "id",
  ].join(","),
);
endpoint.searchParams.set("tenant_id", `eq.${TENANT_ID}`);
endpoint.searchParams.set("status", "eq.published");
endpoint.searchParams.set("order", "title.asc");

const response = await fetchWithRetry(endpoint, {
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

async function fetchTable(table, select, order) {
  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  url.searchParams.set("select", select);
  url.searchParams.set("tenant_id", `eq.${TENANT_ID}`);
  if (order) url.searchParams.set("order", order);
  const result = await fetchWithRetry(url, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      Accept: "application/json",
    },
  });
  if (!result.ok) {
    const body = await result.text();
    throw new Error(`Could not read ${table} from Billing Hub (${result.status}): ${body.slice(0, 300)}`);
  }
  const data = await result.json();
  if (!Array.isArray(data)) throw new Error(`Billing Hub returned an invalid ${table} payload.`);
  return data;
}

const [groupRows, sourceRows, relationRows, redirectRows] = await Promise.all([
  fetchTable("website_resource_groups", "category_slug,group_slug,name,display_order,intro", "category_slug.asc,display_order.asc"),
  fetchTable("website_resource_sources", "resource_id,title,url,organization,display_order", "resource_id.asc,display_order.asc"),
  fetchTable("website_resource_relations", "resource_id,related_resource_id,relation_type,display_order", "resource_id.asc,display_order.asc"),
  fetchTable("website_resource_redirects", "from_path,to_path", "from_path.asc"),
]);

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
    "status",
    "published_at",
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
}

for (const row of rows) {
  if (row.resource_kind !== "article" && row.resource_kind !== "category") {
    throw new Error(
      `Published resource ${row.slug} has invalid resource_kind: ${String(row.resource_kind)}.`,
    );
  }

  row.category_slug =
    typeof row.category_slug === "string" && row.category_slug.trim()
      ? row.category_slug.trim()
      : null;

  if (row.resource_kind === "article" && !row.category_slug) {
    throw new Error(`Published article ${row.slug} is missing category_slug.`);
  }

  if (row.resource_kind === "category" && row.category_slug !== null) {
    throw new Error(`Published category ${row.slug} must not have category_slug.`);
  }
}

const publishedCategorySlugs = new Set(
  rows.filter((row) => row.resource_kind === "category").map((row) => row.slug),
);

for (const row of rows) {
  if (
    row.resource_kind === "article" &&
    !publishedCategorySlugs.has(row.category_slug)
  ) {
    throw new Error(
      `Published article ${row.slug} references missing published category ${row.category_slug}.`,
    );
  }
}

const routePaths = rows.map((row) =>
  row.resource_kind === "article"
    ? `/resources/${row.category_slug}/${row.slug}`
    : `/resources/${row.slug}`,
);
const uniqueRoutePaths = new Set(routePaths);
if (uniqueRoutePaths.size !== routePaths.length) {
  throw new Error("Published website resources contain duplicate public routes.");
}

const keyById = new Map(
  rows
    .filter((row) => row.resource_kind === "article")
    .map((row) => [row.id, `${row.category_slug}/${row.slug}`]),
);
for (const row of rows) {
  row.sources = sourceRows
    .filter((source) => source.resource_id === row.id)
    .map(({ title, url, organization }) => ({ title, url, organization }));
  row.related = relationRows
    .filter((relation) => relation.resource_id === row.id && relation.relation_type === "related")
    .flatMap((relation) => (keyById.has(relation.related_resource_id) ? [keyById.get(relation.related_resource_id)] : []));
}

const canonicalResourcePaths = new Set(routePaths);
const resourceRedirects = redirectRows.map((redirect) => ({ from: redirect.from_path, to: redirect.to_path }));
for (const redirect of resourceRedirects) {
  if (canonicalResourcePaths.has(redirect.from)) {
    throw new Error(`Resource redirect ${redirect.from} is also a published page.`);
  }
  if (redirect.to !== "/resources" && !canonicalResourcePaths.has(redirect.to)) {
    throw new Error(`Resource redirect ${redirect.from} points at ${redirect.to}, which is not published.`);
  }
}

const tsHeader = `// Generated from public.website_resources_public. Do not edit by hand.\n// scripts/generate-resource-content.mjs refreshes this file before production builds.\n\nexport type GeneratedWebsiteResource = {\n  slug: string;\n  title: string;\n  primary_question: string;\n  summary: string;\n  body_markdown: string;\n  faq: unknown[];\n  audience_tags: string[];\n  topic_aliases: string[];\n  source_urls?: string[];\n  coverage_status?: \"partial\" | \"complete\" | \"needs_review\";\n  status: \"published\";\n  live_url?: string | null;\n  last_researched_at?: string | null;\n  published_at: string | null;\n  public_updated_at?: string | null;\n  resource_kind: "category" | "article";\n  category_slug: string | null;\n  sort_order?: number;\n  quick_answer?: string | null;\n  in_practice_markdown?: string | null;\n  reviewed_by?: string;\n  last_reviewed_on?: string | null;\n  cta?: "find_care" | "join_network" | "support_foundation";\n  group_slug?: string | null;\n  id?: string;\n  sources?: { title: string; url: string; organization: string | null }[];\n  related?: string[];\n};\n\nexport type GeneratedResourceGroup = {\n  category_slug: string;\n  group_slug: string;\n  name: string;\n  display_order: number;\n  intro: string | null;\n};\n\n`;

const resourceModule = `${tsHeader}export const generatedWebsiteResources: GeneratedWebsiteResource[] = ${JSON.stringify(rows, null, 2)};\n\nexport const generatedResourceGroups: GeneratedResourceGroup[] = ${JSON.stringify(groupRows, null, 2)};\n`;
const routeRows = rows.map((row) => ({
  path:
    row.resource_kind === "article"
      ? `/resources/${row.category_slug}/${row.slug}`
      : `/resources/${row.slug}`,
  title: `${row.title} | ValorWell`,
  description: row.summary,
  h1: row.title,
  lead: row.summary,
  indexable: true,
  sitemap: true,
}));
const routeModule = `// Generated from public.website_resources_public. Do not edit by hand.\n// scripts/generate-resource-content.mjs refreshes this file before production builds.\n\nexport const generatedResourceRoutes = ${JSON.stringify(routeRows, null, 2)};\n\nexport const generatedResourceRedirects = ${JSON.stringify(resourceRedirects, null, 2)};\n`;

const resourceOutput = path.join(ROOT, "src", "generated", "websiteResources.ts");
const routeOutput = path.join(ROOT, "route-contract", "generated-resource-routes.mjs");
fs.mkdirSync(path.dirname(resourceOutput), { recursive: true });
fs.writeFileSync(resourceOutput, resourceModule, "utf8");
fs.writeFileSync(routeOutput, routeModule, "utf8");

console.log(
  `Generated ${rows.length} published website resources, ${groupRows.length} topic groups, and ${resourceRedirects.length} resource redirects from Billing Hub.`,
);
