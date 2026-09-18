import fs from "node:fs";
import path from "node:path";
import Markdoc from "@markdoc/markdoc";

const ROOT = process.cwd();
const GENERATED = path.join(ROOT, "src", "generated", "websiteResources.ts");

if (!fs.existsSync(GENERATED)) {
  throw new Error("Generated website resource snapshot is missing. Run npm run generate:resources first.");
}

function readGeneratedResources() {
  const source = fs.readFileSync(GENERATED, "utf8");
  const marker = "export const generatedWebsiteResources: GeneratedWebsiteResource[] = ";
  const start = source.indexOf(marker);

  if (start < 0) {
    throw new Error("Could not locate generatedWebsiteResources in the generated resource module.");
  }

  const jsonStart = start + marker.length;
  const jsonEnd = source.lastIndexOf(";");

  if (jsonEnd <= jsonStart) {
    throw new Error("Generated resource module has an invalid payload.");
  }

  return JSON.parse(source.slice(jsonStart, jsonEnd));
}

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

  return errors;
}

const rows = readGeneratedResources();
const failures = [];

for (const row of rows) {
  const errors = validateRow(row);
  if (errors.length > 0) {
    failures.push({ slug: row.slug, errors });
  }
}

const slugs = rows.map((row) => row.slug);
if (new Set(slugs).size !== slugs.length) {
  failures.push({ slug: "(library)", errors: ["duplicate public slugs detected"] });
}

const categories = new Set(
  rows.filter((row) => row.resource_kind === "category").map((row) => row.slug),
);
for (const row of rows.filter((item) => item.resource_kind === "article")) {
  if (!categories.has(row.category_slug)) {
    failures.push({
      slug: row.slug,
      errors: [`references missing published category: ${row.category_slug}`],
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
  `Validated ${rows.length} published resources (${rows.filter((row) => row.resource_kind === "article").length} articles, ${rows.filter((row) => row.resource_kind === "category").length} categories).`,
);
