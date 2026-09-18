import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";
import { compileResourceMarkdoc } from "../src/content/resource-markdoc-config.mjs";

const ROOT = process.cwd();
const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const resourcePath = path.join(ROOT, "src", "generated", "websiteResources.json");

if (!fs.existsSync(resourcePath)) {
  throw new Error(
    "Resource validation expected src/generated/websiteResources.json. Run npm run generate:resources first.",
  );
}

const resources = JSON.parse(fs.readFileSync(resourcePath, "utf8"));
if (!Array.isArray(resources)) {
  throw new Error("Generated website resources must be an array.");
}

const env = loadEnv(process.env.NODE_ENV || "production", ROOT, "VITE_");
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function fetchPublicSources() {
  if (!supabaseUrl || !publishableKey) return [];

  const endpoint = new URL("/rest/v1/website_resource_sources", supabaseUrl);
  endpoint.searchParams.set("select", "resource_id,citation_key,is_public");
  endpoint.searchParams.set("tenant_id", `eq.${TENANT_ID}`);
  endpoint.searchParams.set("is_public", "eq.true");

  const response = await fetch(endpoint, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Could not validate structured resource sources (${response.status}).`,
    );
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

const publicSources = await fetchPublicSources();
const sourceKeys = new Map();

for (const source of publicSources) {
  if (
    typeof source.resource_id !== "string" ||
    typeof source.citation_key !== "string"
  ) {
    continue;
  }

  const keys = sourceKeys.get(source.resource_id) ?? new Set();
  keys.add(source.citation_key);
  sourceKeys.set(source.resource_id, keys);
}

const errors = [];
const warnings = [];
const internalMetadataPattern =
  /^(?:#{1,6}\s+)?(?:authoritative sources reviewed|sources reviewed|last researched|last reviewed)\b/im;

for (const resource of resources) {
  const label = resource.slug || resource.title || "(unknown resource)";
  const schemaVersion = Number(resource.content_schema_version ?? 1);
  const body = String(resource.body_markdown ?? "");

  if (resource.resource_kind === "article" && !resource.category_slug) {
    errors.push(`${label}: article is missing category_slug.`);
  }

  if (body.includes("<script") || body.includes("javascript:")) {
    errors.push(`${label}: body contains unsafe raw markup or a javascript URL.`);
  }

  if (schemaVersion >= 2 && internalMetadataPattern.test(body)) {
    errors.push(
      `${label}: schema v2 body contains internal research metadata. Store research metadata structurally instead.`,
    );
  }

  if (String(resource.title ?? "").length > 120) {
    warnings.push(`${label}: title is longer than 120 characters.`);
  }

  if (String(resource.summary ?? "").length > 360) {
    warnings.push(`${label}: summary is longer than 360 characters.`);
  }

  const compiled = compileResourceMarkdoc(body, { schemaVersion });
  for (const issue of compiled.issues) {
    const message = `${label}: ${issue.message}`;
    if (issue.level === "critical" || issue.level === "error") {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  const citations = [
    ...body.matchAll(/\{%\s*cite\s+key=["']([^"']+)["'][^%]*\/%\}/g),
  ].map((match) => match[1]);

  const validKeys = sourceKeys.get(resource.id) ?? new Set();
  for (const citation of citations) {
    if (!validKeys.has(citation)) {
      errors.push(
        `${label}: citation "${citation}" does not match a public structured source.`,
      );
    }
  }
}

for (const warning of warnings) {
  console.warn(`RESOURCE WARNING: ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`RESOURCE ERROR: ${error}`);
  }
  throw new Error(
    `Resource content validation failed with ${errors.length} error(s).`,
  );
}

console.log(
  `Validated ${resources.length} published resources with Markdoc (${warnings.length} warning(s)).`,
);
