import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SEARCH_ROOTS = ["src", "public", "dist"];
const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
]);

const RETIRED_ROUTE = "/becomeapatient";
const PROHIBITED_POSITIONING =
  "helps veterans with gaining the va ratings that they deserve";

function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function collectTextFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTextFiles(fullPath));
      continue;
    }

    if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

const violations = [];

for (const searchRoot of SEARCH_ROOTS) {
  const absoluteRoot = path.join(ROOT, searchRoot);

  for (const filePath of collectTextFiles(absoluteRoot)) {
    const content = fs.readFileSync(filePath, "utf8");
    const normalized = normalizeText(content);
    const relativePath = path.relative(ROOT, filePath);

    if (normalized.includes(RETIRED_ROUTE)) {
      violations.push(`${relativePath}: contains retired route ${RETIRED_ROUTE}`);
    }

    if (normalized.includes(PROHIBITED_POSITIONING)) {
      violations.push(
        `${relativePath}: contains prohibited VA disability-rating positioning`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("ValorWell positioning guardrails failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(
  "ValorWell positioning guardrails passed: retired patient route and prohibited VA-rating claim are absent.",
);
