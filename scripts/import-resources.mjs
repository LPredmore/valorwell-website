#!/usr/bin/env node
// Imports the resources sheet into Billing Hub.
//
// Export three tabs of "ValorWell Website Resources (Master)" as CSV
// (File > Download > CSV, once per tab), then:
//
//   npm run import:resources -- --pages Pages.csv --categories Categories.csv --groups Groups.csv
//       Checks every row and prints the report. Nothing is sent.
//
//   ... --dry-run     Sends to the importer, which runs the whole import and
//                     rolls it back, reporting exactly what would change.
//   ... --apply       Sends to the importer and writes the changes.
//
//   ... --payload out.json   Also writes the import payload to a file.
//
// --dry-run and --apply need RESOURCE_IMPORT_URL (the import-website-resources
// function URL) and RESOURCE_IMPORT_TOKEN in the environment.

import fs from "node:fs";
import process from "node:process";

const { parseCsv, buildImport } = await import("../supabase/functions/_shared/resourceSheet.ts");

function arg(name) {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
}
const flag = (name) => process.argv.includes(`--${name}`);

const paths = { pages: arg("pages"), categories: arg("categories"), groups: arg("groups") };
for (const [tab, file] of Object.entries(paths)) {
  if (!file) {
    console.error(`Missing --${tab} <file.csv>.`);
    process.exit(2);
  }
}

const csv = Object.fromEntries(
  Object.entries(paths).map(([tab, file]) => [tab, fs.readFileSync(file, "utf8")]),
);
const result = buildImport({
  pages: parseCsv(csv.pages),
  categories: parseCsv(csv.categories),
  groups: parseCsv(csv.groups),
});

function printProblems(label, list) {
  if (list.length === 0) return;
  console.log(`\n${label} (${list.length}):`);
  for (const item of list) {
    console.log(`  row ${item.row} ${item.key}`);
    for (const problem of item.problems) console.log(`    - ${problem}`);
  }
}

console.log("Sheet check");
console.log(`  pages ready to publish:   ${result.summary.articles}`);
console.log(`  pages retired (redirect): ${result.summary.retired}`);
console.log(`  rows not ready (skipped): ${result.summary.skippedNotReady}`);
console.log(`  rows with errors:         ${result.summary.skippedWithErrors}`);
console.log(`  topics live / archived:   ${result.summary.categoriesPublished} / ${result.summary.categoriesArchived}`);
printProblems("Errors (these rows will not be imported)", result.errors);
printProblems("Warnings", result.warnings);

const payloadPath = arg("payload");
if (payloadPath) {
  fs.writeFileSync(payloadPath, JSON.stringify(result.payload, null, 2));
  console.log(`\nWrote payload to ${payloadPath}`);
}

const send = flag("apply") ? "apply" : flag("dry-run") ? "dry-run" : null;
if (!send) {
  process.exit(result.errors.length > 0 ? 1 : 0);
}

const url = process.env.RESOURCE_IMPORT_URL;
const token = process.env.RESOURCE_IMPORT_TOKEN;
if (!url || !token) {
  console.error("\nSet RESOURCE_IMPORT_URL and RESOURCE_IMPORT_TOKEN to send the import.");
  process.exit(2);
}

const response = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    dry_run: send !== "apply",
    pages_csv: csv.pages,
    categories_csv: csv.categories,
    groups_csv: csv.groups,
  }),
});
const body = await response.json().catch(() => ({}));
console.log(`\nImporter (${send}) responded ${response.status}:`);
console.log(JSON.stringify(body.result ?? body, null, 2));
process.exit(response.ok ? 0 : 1);
