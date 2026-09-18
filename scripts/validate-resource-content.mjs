import fs from "node:fs";
import path from "node:path";
import Markdoc from "@markdoc/markdoc";

const ROOT = process.cwd();
const GENERATED = path.join(ROOT, "src", "generated", "websiteResources.ts");

if (!fs.existsSync(GENERATED)) {
  throw new Error("Generated website resource snapshot is missing. Run npm run generate:resources first.");
}

function extractGeneratedArray(source, exportName) {
  const marker = `export const ${exportName}`;
  const markerStart = source.indexOf(marker);

  if (markerStart < 0) {
    throw new Error(`Could not locate ${exportName} in the generated resource module.`);
  }

  const equals = source.indexOf("=", markerStart);
  if (equals < 0) throw new Error(`${exportName} has no assignment.`);

  const jsonStart = source.indexOf("[", equals);
  const jsonEnd = source.indexOf(";\n", jsonStart);

  if (jsonStart < 0 || jsonEnd < 0) {
    throw new Error(`${exportName} has an invalid generated payload.`);
  }

  return JSON.parse(source.slice(jsonStart, jsonEnd));
}

const generatedSource = fs.readFileSync(GENERATED, "utf8");
const rows = extractGeneratedArray(generatedSource, "generatedWebsiteResources");
const sources = extractGeneratedArray(generatedSource, "generatedWebsiteResourceSources");
const relations = extractGeneratedArray(generatedSource, "generatedWebsiteResourceRelations");

const tags = {
  answer: {
    render: "ResourceAnswer",
    attributes: { title: { type: String, default: "The direct answer" } },
  },
  takeaways: {
    render: "ResourceTakeaways",
    attributes: { title: { type: String, default: "Key takeaways" } },
  },
  steps: {
    render: "ResourceSteps",
    attributes: { title: { type: String, default: "What to do" } },
  },
  verify: {
    render: "ResourceVerify",
    attributes: {
      program: { type: String },
      title: { type: String, default: "Verify before you act" },
    },
  },
  warning: {
    render: "ResourceCallout",
    attributes: {
      title: { type: String, default: "Important" },
      tone: { type: String, default: "warning", matches: ["warning"] },
    },
  },
  note: {
    render: "ResourceCallout",
    attributes: {
      title: { type: String, default: "Note" },
      tone: { type: String, default: "note", matches: ["note"] },
    },
  },
  definition: {
    render: "ResourceDefinition",
    attributes: { term: { type: String } },
  },
  cite: {
    render: "ResourceCitation",
    attributes: { source: { type: String, required: true } },
  },
};

function headingStructureErrors(ast, row) {
  const errors = [];
  let previousLevel = 1;
  let h2Count = 0;

  for (const node of ast.walk()) {
    if (node.type !== "heading") continue;

    const level = Number(node.attributes.level);
    if (!Number.isFinite(level)) continue;

    if (level === 1) {
      errors.push("body contains H1; the page title is the only H1");
      continue;
    }

    if (level === 2) h2Count += 1;

    if (level > previousLevel + 1) {
      errors.push(`heading hierarchy skips from H${previousLevel} to H${level}`);
    }

    previousLevel = level;
  }

  if (row.resource_kind === "article" && h2Count === 0) {
    errors.push("article body must contain at least one H2");
  }

  return errors;
}

function duplicateFaqErrors(row) {
  const seen = new Set();
  const errors = [];

  for (const faq of row.faq ?? []) {
    const question = typeof faq?.question === "string" ? faq.question.trim().toLowerCase() : "";
    if (!question) continue;

    if (seen.has(question)) {
      errors.push(`duplicate FAQ question: ${faq.question}`);
    }

    seen.add(question);
  }

  return errors;
}

const sourcesByResource = new Map();
for (const source of sources) {
  const keys = sourcesByResource.get(source.resource_id) ?? new Set();
  keys.add(source.citation_key);
  sourcesByResource.set(source.resource_id, keys);
}

function citationErrors(ast, row) {
  const errors = [];
  const keys = sourcesByResource.get(row.id) ?? new Set();

  for (const node of ast.walk()) {
    if (node.type !== "tag" || node.tag !== "cite") continue;

    const key = node.attributes?.source;
    if (typeof key !== "string" || !key.trim()) continue;

    if (!keys.has(key)) {
      errors.push(`citation references missing public source key: ${key}`);
    }
  }

  return errors;
}

function validateRow(row) {
  const errors = [];

  if (![1, 2].includes(row.content_schema_version)) {
    errors.push(
      `content_schema_version ${row.content_schema_version} is unsupported; expected 1 or 2`,
    );
  }

  if (row.resource_kind === "category") {
    if (row.editorial_type !== "category") {
      errors.push("category rows must use editorial_type=category");
    }
    if (row.category_slug !== null) {
      errors.push("category rows must not have category_slug");
    }
  } else {
    if (!row.category_slug) {
      errors.push("article rows must have category_slug");
    }
    if (row.editorial_type === "category") {
      errors.push("article rows cannot use editorial_type=category");
    }
  }

  if (row.seo_title && row.seo_title.length > 70) {
    errors.push("seo_title should be 70 characters or fewer");
  }

  if (row.seo_description && row.seo_description.length > 180) {
    errors.push("seo_description should be 180 characters or fewer");
  }

  const ast = Markdoc.parse(row.body_markdown);
  const config = { tags: row.content_schema_version >= 2 ? tags : {} };

  for (const validation of Markdoc.validate(ast, config)) {
    const message = validation.error?.message ?? String(validation.error ?? "invalid Markdoc");
    errors.push(`Markdoc: ${message}`);
  }

  errors.push(...headingStructureErrors(ast, row));
  errors.push(...duplicateFaqErrors(row));

  if (row.content_schema_version >= 2) {
    errors.push(...citationErrors(ast, row));
  }

  return errors;
}

const failures = [];

for (const row of rows) {
  const errors = validateRow(row);
  if (errors.length > 0) failures.push({ slug: row.slug, errors });
}

const slugs = rows.map((row) => row.slug);
if (new Set(slugs).size !== slugs.length) {
  failures.push({ slug: "(library)", errors: ["duplicate public slugs detected"] });
}

const categories = new Set(
  rows.filter((row) => row.resource_kind === "category").map((row) => row.slug),
);
const publicIds = new Set(rows.map((row) => row.id));

for (const row of rows.filter((item) => item.resource_kind === "article")) {
  if (!categories.has(row.category_slug)) {
    failures.push({
      slug: row.slug,
      errors: [`references missing published category: ${row.category_slug}`],
    });
  }
}

for (const source of sources) {
  if (!publicIds.has(source.resource_id)) {
    failures.push({
      slug: "(sources)",
      errors: [`source ${source.citation_key} references non-public resource ${source.resource_id}`],
    });
  }
}

for (const relation of relations) {
  if (!publicIds.has(relation.resource_id) || !publicIds.has(relation.related_resource_id)) {
    failures.push({
      slug: "(relations)",
      errors: ["curated relation references a non-public resource"],
    });
  }
}

if (failures.length > 0) {
  const report = failures
    .map(
      ({ slug, errors }) =>
        `${slug}:\n${errors.map((error) => `  - ${error}`).join("\n")}`,
    )
    .join("\n\n");

  throw new Error(`Resource content validation failed:\n\n${report}`);
}

console.log(
  `Validated ${rows.length} published resources, ${sources.length} public sources, and ${relations.length} curated relations.`,
);
