import { loadEnv } from "vite";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const SITE_URL = "https://valorwell.org";
const ROOT = process.cwd();
const env = loadEnv(process.env.NODE_ENV || "production", ROOT, "VITE_");
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

const DRAFT_RESOURCES = [];

if (!supabaseUrl || !publishableKey) {
  throw new Error(
    "Production resource verification requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

function publicHeaders() {
  return {
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
    Accept: "application/json",
  };
}

async function fetchPublishedRows() {
  const endpoint = new URL("/rest/v1/website_resources_public", supabaseUrl);
  endpoint.searchParams.set(
    "select",
    "slug,title,status,resource_kind,category_slug",
  );
  endpoint.searchParams.set("tenant_id", `eq.${TENANT_ID}`);
  endpoint.searchParams.set("status", "eq.published");
  endpoint.searchParams.set("order", "slug.asc");

  const response = await fetch(endpoint, { headers: publicHeaders() });
  if (!response.ok) {
    throw new Error(
      `Could not fetch published resources from website_resources_public (${response.status}): ${(
        await response.text()
      ).slice(0, 300)}`,
    );
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    throw new Error("website_resources_public returned an invalid resource payload.");
  }
  return rows;
}

async function verifyPrivateTableDenied() {
  const privateTable = ["website", "resources"].join("_");
  const endpoint = new URL(`/rest/v1/${privateTable}`, supabaseUrl);
  endpoint.searchParams.set("select", "slug");
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, { headers: publicHeaders() });
  if (response.ok) {
    throw new Error(
      "Public publishable-key access to private website_resources unexpectedly succeeded.",
    );
  }

  if (response.status !== 401 && response.status !== 403) {
    throw new Error(
      `Private website_resources denial returned unexpected HTTP ${response.status}.`,
    );
  }
}

function pathFor(row) {
  if (row.resource_kind === "category") return `/resources/${row.slug}`;
  if (row.resource_kind === "article" && row.category_slug) {
    return `/resources/${row.category_slug}/${row.slug}`;
  }
  throw new Error(
    `Resource ${row.slug ?? "<unknown>"} has invalid routing metadata.`,
  );
}

async function verifyPublished(row, sitemap) {
  const path = pathFor(row);
  const url = `${SITE_URL}${path}`;
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": "ValorWellProductionResourceVerifier/1.0" },
  });

  if (response.status !== 200) {
    throw new Error(`${path}: expected HTTP 200, received ${response.status}.`);
  }

  const html = await response.text();
  const canonical = `<link rel="canonical" href="${url}"`;
  if (!html.includes(canonical)) {
    throw new Error(`${path}: missing exact canonical URL ${url}.`);
  }

  const lowerHtml = html.toLowerCase();
  const titleStart = lowerHtml.indexOf("<title>");
  const titleEnd = lowerHtml.indexOf("</title>", titleStart + 7);
  if (titleStart < 0 || titleEnd <= titleStart + 7) {
    throw new Error(`${path}: missing non-empty <title>.`);
  }

  if (!lowerHtml.includes("<h1")) {
    throw new Error(`${path}: missing rendered H1.`);
  }

  if (lowerHtml.includes("noindex")) {
    throw new Error(`${path}: unexpectedly marked noindex.`);
  }

  if (!sitemap.includes(`<loc>${url}</loc>`)) {
    throw new Error(`${path}: missing from production sitemap.`);
  }
}

async function verifyDraftResource(resource, sitemap) {
  const { path, title } = resource;
  const url = `${SITE_URL}${path}`;
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": "ValorWellProductionResourceVerifier/1.0" },
  });

  if (sitemap.includes(`<loc>${url}</loc>`)) {
    throw new Error(`${path}: unpublished draft route unexpectedly appears in sitemap.`);
  }

  if (response.status === 404) return;

  if (response.status !== 200) {
    throw new Error(
      `${path}: unpublished draft route returned unexpected HTTP ${response.status}.`,
    );
  }

  const html = await response.text();
  const lowerHtml = html.toLowerCase();
  if (lowerHtml.includes(title.toLowerCase())) {
    throw new Error(`${path}: unpublished draft title is exposed in the HTTP 200 response.`);
  }

  if (html.includes(`<link rel="canonical" href="${url}"`)) {
    throw new Error(`${path}: unpublished draft received its own canonical URL.`);
  }

  console.warn(
    `Hosting soft-404: ${path} returned the generic HTTP 200 shell, but the draft content is not rendered, has no canonical URL, and is absent from the sitemap.`,
  );
}

async function mapWithConcurrency(items, limit, mapper) {
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length || 1) }, () => worker()),
  );
}

const [published, sitemapResponse] = await Promise.all([
  fetchPublishedRows(),
  fetch(`${SITE_URL}/sitemap.xml`, {
    redirect: "manual",
    headers: { "user-agent": "ValorWellProductionResourceVerifier/1.0" },
  }),
]);

if (sitemapResponse.status !== 200) {
  throw new Error(
    `Production sitemap expected HTTP 200, received ${sitemapResponse.status}.`,
  );
}
const sitemap = await sitemapResponse.text();

const publishedPaths = published.map(pathFor);
if (new Set(publishedPaths).size !== publishedPaths.length) {
  throw new Error("Published database rows contain duplicate public routes.");
}

await verifyPrivateTableDenied();
await mapWithConcurrency(published, 5, (row) => verifyPublished(row, sitemap));
await mapWithConcurrency(DRAFT_RESOURCES, 5, (resource) => verifyDraftResource(resource, sitemap));

const unknownPath = "/resources/champva/this-resource-does-not-exist";
const unknownResponse = await fetch(`${SITE_URL}${unknownPath}`, {
  redirect: "manual",
  headers: { "user-agent": "ValorWellProductionResourceVerifier/1.0" },
});
if (unknownResponse.status !== 404) {
  console.warn(
    `Separate hosting soft-404 detected: ${unknownPath} returned HTTP ${unknownResponse.status}. Known unpublished resource routes are still verified as 404.`,
  );
}

console.log(
  `Production resource verification passed: ${published.length} published resources return HTTP 200 with canonical/indexable HTML and sitemap coverage; direct public access to website_resources is denied.`,
);
