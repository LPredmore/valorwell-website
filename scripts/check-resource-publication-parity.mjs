import { loadEnv } from "vite";
import { generatedResourceRoutes } from "../route-contract/generated-resource-routes.mjs";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const env = loadEnv(process.env.NODE_ENV || "production", process.cwd(), "VITE_");
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  throw new Error(
    "Resource publication parity check requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

const endpoint = new URL("/rest/v1/website_resources_public", supabaseUrl);
endpoint.searchParams.set("select", "slug,status,resource_kind,category_slug");
endpoint.searchParams.set("tenant_id", `eq.${TENANT_ID}`);
endpoint.searchParams.set("status", "eq.published");
endpoint.searchParams.set("order", "slug.asc");

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
    `Could not verify public resource publication parity (${response.status}): ${body.slice(0, 300)}`,
  );
}

const rows = await response.json();
if (!Array.isArray(rows)) {
  throw new Error("Billing Hub returned an invalid website_resources_public payload.");
}

function publicPath(row) {
  if (typeof row.slug !== "string" || !row.slug.trim()) {
    throw new Error("A published public resource is missing slug.");
  }

  if (row.status !== "published") {
    throw new Error(`Non-published resource ${row.slug} reached the public projection.`);
  }

  if (row.resource_kind === "category") {
    if (row.category_slug !== null) {
      throw new Error(`Published category ${row.slug} must not have category_slug.`);
    }
    return `/resources/${row.slug}`;
  }

  if (row.resource_kind === "article") {
    if (typeof row.category_slug !== "string" || !row.category_slug.trim()) {
      throw new Error(`Published article ${row.slug} is missing category_slug.`);
    }
    return `/resources/${row.category_slug}/${row.slug}`;
  }

  throw new Error(
    `Published resource ${row.slug} has invalid resource_kind: ${String(row.resource_kind)}.`,
  );
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

const expectedPaths = rows.map(publicPath).sort();
const generatedPaths = generatedResourceRoutes.map((route) => route.path).sort();

const expectedDuplicates = duplicates(expectedPaths);
if (expectedDuplicates.length > 0) {
  throw new Error(
    `Billing Hub public resources contain duplicate routes: ${expectedDuplicates.join(", ")}`,
  );
}

const generatedDuplicates = duplicates(generatedPaths);
if (generatedDuplicates.length > 0) {
  throw new Error(
    `Generated resource routes contain duplicates: ${generatedDuplicates.join(", ")}`,
  );
}

const expected = new Set(expectedPaths);
const generated = new Set(generatedPaths);
const missing = expectedPaths.filter((route) => !generated.has(route));
const extra = generatedPaths.filter((route) => !expected.has(route));

if (missing.length > 0 || extra.length > 0) {
  const details = [
    missing.length > 0
      ? `missing generated routes: ${missing.slice(0, 20).join(", ")}`
      : null,
    extra.length > 0
      ? `extra generated routes: ${extra.slice(0, 20).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("; ");

  throw new Error(
    `Resource publication parity failed (public=${expectedPaths.length}, generated=${generatedPaths.length}): ${details}`,
  );
}

console.log(
  `Resource publication parity passed: ${expectedPaths.length} public resources match ${generatedPaths.length} generated routes.`,
);
