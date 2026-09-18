import fs from "node:fs";
import path from "node:path";
import * as pagefind from "pagefind";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const OUTPUT = path.join(DIST, "pagefind");

if (!fs.existsSync(DIST)) {
  throw new Error("Expected dist/ before building the resource search index.");
}

const { index } = await pagefind.createIndex({
  forceLanguage: "en",
  writePlayground: false,
  verbose: false,
});

if (!index) {
  throw new Error("Pagefind could not create a search index.");
}

const added = await index.addDirectory({
  path: DIST,
  glob: "**/index.html",
});

if (added.errors?.length) {
  throw new Error(`Pagefind indexing failed:\n${added.errors.join("\n")}`);
}

const written = await index.writeFiles({ outputPath: OUTPUT });

if (written.errors?.length) {
  throw new Error(`Pagefind could not write its index:\n${written.errors.join("\n")}`);
}

await pagefind.close();

console.log(
  `Built Pagefind resource search index from ${added.page_count ?? 0} page(s).`,
);
