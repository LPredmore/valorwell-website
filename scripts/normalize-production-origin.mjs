import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const OLD_ORIGIN = "https://www.valorwell.org";
const CANONICAL_ORIGIN = "https://valorwell.org";
const TEXT_EXTENSIONS = new Set([".html", ".xml", ".txt", ".js", ".css", ".json"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

if (!fs.existsSync(DIST_DIR)) {
  throw new Error(`Expected build output at ${DIST_DIR}`);
}

let replacementCount = 0;
const files = walk(DIST_DIR).filter((file) => TEXT_EXTENSIONS.has(path.extname(file)));

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(OLD_ORIGIN)) continue;

  const matches = source.split(OLD_ORIGIN).length - 1;
  const normalized = source.replaceAll(OLD_ORIGIN, CANONICAL_ORIGIN);
  fs.writeFileSync(file, normalized, "utf8");
  replacementCount += matches;
}

const remaining = files.filter((file) => fs.readFileSync(file, "utf8").includes(OLD_ORIGIN));
if (remaining.length) {
  throw new Error(
    `Production output still contains ${OLD_ORIGIN}: ${remaining.map((file) => path.relative(DIST_DIR, file)).join(", ")}`,
  );
}

console.log(
  `Normalized ${replacementCount} production URL reference${replacementCount === 1 ? "" : "s"} to ${CANONICAL_ORIGIN}.`,
);
