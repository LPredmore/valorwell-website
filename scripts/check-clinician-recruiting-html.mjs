import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const expectedFiles = [
  path.join(DIST_DIR, "clinicians", "index.html"),
  path.join(DIST_DIR, "clinicians.html"),
];

const requiredFragments = [
  "Telehealth Mental Health Clinician Opportunities | ValorWell",
  "You handle the therapy. We handle almost everything else.",
  "paid no-shows",
  "ValorWell-managed credentialing",
  "Choose when you work, how much you work, who you treat, and how you practice",
];

const staleFragments = [
  "$75 per completed session",
  "Provide telehealth care with a schedule you control.",
  "ValorWell contracts with independently licensed mental health clinicians to serve veterans and military families through a telehealth-first clinical environment.",
];

for (const filePath of expectedFiles) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected clinician route output at ${filePath}`);
  }

  const html = fs.readFileSync(filePath, "utf8");
  for (const fragment of requiredFragments) {
    if (!html.includes(fragment)) {
      throw new Error(
        `Clinician route output ${path.relative(DIST_DIR, filePath)} is missing current copy: ${fragment}`,
      );
    }
  }
  for (const fragment of staleFragments) {
    if (html.includes(fragment)) {
      throw new Error(
        `Clinician route output ${path.relative(DIST_DIR, filePath)} still contains stale copy: ${fragment}`,
      );
    }
  }
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const staleFiles = [];
for (const filePath of walk(DIST_DIR)) {
  if (!/\.(?:html|js|css|json|xml|txt)$/i.test(filePath)) continue;
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes("$75 per completed session")) {
    staleFiles.push(path.relative(DIST_DIR, filePath));
  }
}

if (staleFiles.length > 0) {
  throw new Error(
    `Stale public clinician pay copy remains in build output: ${staleFiles.join(", ")}`,
  );
}

console.log("Clinician recruiting build output matches the current source copy.");
