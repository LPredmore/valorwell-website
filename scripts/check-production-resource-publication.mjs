import { loadEnv } from "vite";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const SITE_URL = "https://valorwell.org";
const ROOT = process.cwd();
const env = loadEnv(process.env.NODE_ENV || "production", ROOT, "VITE_");
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  throw new Error(
    "Production resource verification requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

async function fetchRows(table, status) {
  const endpoint = new URL(\`/rest/v1/\${table}\`, supabaseUrl);
  endpoint.searchParams.set(
    "select",
    "slug,title,status,resource_kind,category_slug",
  );
  endpoint.searchParams.set("tenant_id", \`eq.\${TENANT_ID}\`);
  endpoint.searchParams.set("status", \`eq.\${status}\`);
  endpoint.searchParams.set("order", "slug.asc");

  const response = await fetch(endpoint, {
    headers: {
      apikey: publishableKey,
      Authorization: \`Bearer \${publishableKey}\`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      \`Could not fetch \${status} resources from \${table} (\${response.status}): \${(
        await response.text()
      ).slice(0, 300)}\`,
    );
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    throw new Error(\`\${table} returned an invalid resource payload.\`);
  }
  return rows;
}

function pathFor(row) {
  if (row.resource_kind === "category") return \`/resources/\${row.slug}\`;
  if (row.resource_kind === "article" && row.category_slug) {
    return \`/resources/\${row.category_slug}/\${row.slug}\`;
  }
  throw new Error(
    \`Resource \${row.slug ?? "<unknown>"} has invalid routing metadata.\`,
  );
}

async function verifyPublished(row, sitemap) {
  const path = pathFor(row);
  const url = \`\${SITE_URL}\${path}\`;
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": "ValorWellProductionResourceVerifier/1.0" },
  });

  if (response.status !== 200) {
    throw new Error(\`\${path}: expected HTTP 200, received \${response.status}.\`);
  }

  const html = await response.text();
  const canonical = \`<link rel="canonical" href="\${url}"\`;
  if (!html.includes(canonical)) {
    throw new Error(\`\${path}: missing exact canonical URL \${url}.\`);
  }

  if (!/<title>[^<]+<\\/title>/i.test(html)) {
    throw new Error(\`\${path}: missing non-empty <title>.\`);
  }

  if (!/<h1\\b/i.test(html)) {
    throw new Error(\`\${path}: missing rendered H1.\`);
  }

  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    throw new Error(\`\${path}: unexpectedly marked noindex.\`);
  }

  if (!sitemap.includes(\`<loc>\${url}</loc>\`)) {
    throw new Error(\`\${path}: missing from production sitemap.\`);
  }

  return path;
}

async function verifyDraft(row, sitemap) {
  const path = pathFor(row);
  const url = \`\${SITE_URL}\${path}\`;
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "user-agent": "ValorWellProductionResourceVerifier/1.0" },
  });

  if (response.status !== 404) {
    throw new Error(\`\${path}: draft route expected HTTP 404, received \${response.status}.\`);
  }

  if (sitemap.includes(\`<loc>\${url}</loc>\`)) {
    throw new Error(\`\${path}: draft route unexpectedly appears in sitemap.\`);
  }

  return path;
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length || 1) }, () => worker()),
  );
  return results;
}

const [published, drafts, sitemapResponse] = await Promise.all([
  fetchRows("website_resources_public", "published"),
  fetchRows("website_resources", "draft"),
  fetch(\`\${SITE_URL}/sitemap.xml\`, {
    redirect: "manual",
    headers: { "user-agent": "ValorWellProductionResourceVerifier/1.0" },
  }),
]);

if (sitemapResponse.status !== 200) {
  throw new Error(
    \`Production sitemap expected HTTP 200, received \${sitemapResponse.status}.\`,
  );
}
const sitemap = await sitemapResponse.text();

const publishedPaths = published.map(pathFor);
if (new Set(publishedPaths).size !== publishedPaths.length) {
  throw new Error("Published database rows contain duplicate public routes.");
}

await mapWithConcurrency(published, 10, (row) => verifyPublished(row, sitemap));
await mapWithConcurrency(drafts, 10, (row) => verifyDraft(row, sitemap));

const unknownPath = "/resources/champva/this-resource-does-not-exist";
const unknownResponse = await fetch(\`\${SITE_URL}\${unknownPath}\`, {
  redirect: "manual",
  headers: { "user-agent": "ValorWellProductionResourceVerifier/1.0" },
});
if (unknownResponse.status !== 404) {
  throw new Error(
    \`\${unknownPath}: unknown route expected HTTP 404, received \${unknownResponse.status}.\`,
  );
}

console.log(
  \`Production resource verification passed: \${published.length} published resources return HTTP 200 with canonical/indexable HTML and sitemap coverage; \${drafts.length} drafts and the unknown control route return HTTP 404.\`,
);
