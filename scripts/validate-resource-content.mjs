import { loadEnv } from "vite";
import { validateResourceMarkup } from "./resource-content-rules.mjs";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const env = loadEnv(process.env.NODE_ENV || "production", process.cwd(), "VITE_");
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  throw new Error(
    "Resource validation requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
  );
}

const endpoint = new URL("/rest/v1/website_resources", supabaseUrl);
endpoint.searchParams.set(
  "select",
  [
    "slug",
    "title",
    "summary",
    "body_markdown",
    "faq",
    "resource_kind",
    "category_slug",
    "editorial_type",
    "content_schema_version",
  ].join(","),
);
endpoint.searchParams.set("tenant_id", `eq.${TENANT_ID}`);
endpoint.searchParams.set("status", "eq.published");

const response = await fetch(endpoint, {
  headers: {
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
    Accept: "application/json",
  },
});

if (!response.ok) {
  throw new Error(`Resource validation query failed (${response.status}).`);
}

const rows = await response.json();
if (!Array.isArray(rows)) {
  throw new Error("Resource validation received an invalid payload.");
}

const errors = [];
const warnings = [];

for (const row of rows) {
  const prefix = row.slug || row.title || "(unknown resource)";

  if (typeof row.summary !== "string" || row.summary.trim().length < 40) {
    warnings.push(`${prefix}: summary is unusually short.`);
  }

  if (String(row.body_markdown ?? "").includes("\\n")) {
    errors.push(`${prefix}: body contains literal \\n escape sequences instead of real line breaks.`);
  }

  if (!Array.isArray(row.faq)) {
    errors.push(`${prefix}: faq must be an array.`);
  } else {
    const questions = new Set();
    for (const [index, item] of row.faq.entries()) {
      if (!item || typeof item !== "object") {
        errors.push(`${prefix}: FAQ item ${index + 1} is invalid.`);
        continue;
      }

      const question = typeof item.question === "string" ? item.question.trim() : "";
      const answer = typeof item.answer === "string" ? item.answer.trim() : "";

      if (!question || !answer) {
        errors.push(`${prefix}: FAQ item ${index + 1} is missing a question or answer.`);
      }

      const normalized = question.toLowerCase();
      if (normalized && questions.has(normalized)) {
        errors.push(`${prefix}: duplicate FAQ question "${question}".`);
      }
      questions.add(normalized);
    }
  }

  if (row.resource_kind === "article" && !row.category_slug) {
    errors.push(`${prefix}: article is missing category_slug.`);
  }

  if (row.resource_kind === "category" && row.editorial_type !== "category") {
    errors.push(`${prefix}: category must use editorial_type=category.`);
  }

  const validation = validateResourceMarkup(row.body_markdown);
  for (const message of validation.errors) errors.push(`${prefix}: ${message}.`);
  for (const message of validation.warnings) warnings.push(`${prefix}: ${message}.`);
}

if (warnings.length > 0) {
  console.warn("Resource content warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Resource content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${rows.length} published resource records successfully.`);
}
