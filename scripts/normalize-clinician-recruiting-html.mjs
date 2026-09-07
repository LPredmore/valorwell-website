import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const oldDescription =
  "Join ValorWell's telehealth clinician network: $75 per completed session, weekly pay, flexible availability, billing support, and independent clinical judgment.";
const escapedOldDescription =
  "Join ValorWell&#039;s telehealth clinician network: $75 per completed session, weekly pay, flexible availability, billing support, and independent clinical judgment.";
const newDescription =
  "Join ValorWell's clinician network with control over your schedule and clinical work, weekly per-session pay, paid no-shows, and ValorWell-managed credentialing, authorizations, and billing.";
const escapedNewDescription =
  "Join ValorWell&#039;s clinician network with control over your schedule and clinical work, weekly per-session pay, paid no-shows, and ValorWell-managed credentialing, authorizations, and billing.";

const replacements = [
  [
    "Mental Health Clinician Opportunities | ValorWell",
    "Telehealth Mental Health Clinician Opportunities | ValorWell",
  ],
  [oldDescription, newDescription],
  [escapedOldDescription, escapedNewDescription],
  [
    "Provide telehealth care with a schedule you control.",
    "You handle the therapy. We handle almost everything else.",
  ],
  [
    "ValorWell contracts with independently licensed mental health clinicians to serve veterans and military families through a telehealth-first clinical environment.",
    "Choose when you work, how much you work, who you treat, and how you practice while ValorWell handles credentialing, authorizations, billing, payer administration, and the infrastructure surrounding your care.",
  ],
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

if (!fs.existsSync(DIST_DIR)) {
  throw new Error(`Expected build output at ${DIST_DIR}`);
}

let changed = 0;
for (const filePath of walk(DIST_DIR).filter((file) => file.endsWith(".html"))) {
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  for (const [before, after] of replacements) {
    html = html.replaceAll(before, after);
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    changed += 1;
  }
}

if (changed === 0) {
  throw new Error("Clinician prerender normalization did not find the expected route shell.");
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

console.log(`Normalized clinician recruiting metadata in ${changed} generated HTML file(s).`);
