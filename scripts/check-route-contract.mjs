import fs from "node:fs";
import path from "node:path";
import {
  SITE_URL,
  canonicalRoutes,
  redirects,
  retiredRoutes,
  validateRouteContract,
} from "../site-route-contract.mjs";
import { generatedResourceRoutes } from "../route-contract/generated-resource-routes.mjs";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const APP_ROUTES_PATH = path.join(ROOT_DIR, "src", "AppRoutes.tsx");
const MAIN_ENTRY_PATH = path.join(ROOT_DIR, "src", "main.tsx");
const SITEMAP_PATH = path.join(DIST_DIR, "sitemap.xml");
const WORKER_PATH = path.join(DIST_DIR, "_worker.js");
const ASSETS_IGNORE_PATH = path.join(DIST_DIR, ".assetsignore");
const WRANGLER_PATH = path.join(ROOT_DIR, "wrangler.jsonc");

const representativeBodyContent = new Map([
  [
    "/",
    [
      "The VA said our kids were covered. No one would take the coverage.",
      "No one else is fixing this from both sides",
      "American Corporate Partners",
    ],
  ],
  [
    "/how-it-works",
    [
      "Three programs. One reason they all exist.",
      "01 — CHAMPVA Access",
      "02 — VA Community Care (VACCN)",
      "03 — The ValorWell Foundation",
      "Both of these fixes work — when the barrier is paperwork and process.",
    ],
  ],
  [
    "/foundation",
    [
      "Every donated dollar becomes care.",
      "Employer Identification Number",
      "99-2872954",
      "Two organizations. Two jobs. One transparent line between them.",
      "The Foundation receives charitable gifts and uses 100% of those donated funds to pay qualified community mental-health therapists for treatment provided to veterans and their immediate family members.",
      "No Foundation donation dollars are transferred to ValorWell.",
      "veterans and their immediate family members",
    ],
  ],
  [
    "/resources",
    [
      "Clear answers for complicated veteran and military-family systems.",
      "Search the library",
      "Veteran Mental Health",
      "Family Systems",
    ],
  ],
  [
    "/clinicians",
    [
      "You handle the therapy. We handle almost everything else.",
      "The ValorWell Fit Check",
      "We Trust the License",
    ],
  ],
  [
    "/get-care",
    [
      "Start with who needs care. We will help with the path.",
      "Who needs care?",
      "Outpatient mental health care for real life, not just one diagnosis.",
    ],
  ],
]);

const progressiveEnhancementContent = new Map([
  [
    "/",
    [
      'href="/about"',
      'href="/get-care"',
      'href="/how-it-works"',
      'href="/impact"',
      'href="/beyond-the-yellow"',
      'href="/foundation"',
      'href="/partner"',
      'href="/clinicians"',
      "JHuLEqw2yG8",
    ],
  ],
  [
    "/how-it-works",
    [
      'href="/about"',
      'href="/foundation"',
      'href="/donate"',
      "100% of every donation goes directly to the treating therapist.",
    ],
  ],
  [
    "/get-care",
    [
      "You can begin the CHAMPVA intake process now.",
      "VA Community Care starts with a real authorization and an eligible provider path.",
      "ValorWell is still completing the TRICARE contracting pathway.",
      'href="https://client.valorwell.org"',
      'href="/resources/va-community-care"',
      'href="mailto:info@valorwell.org?subject=TRICARE%20mental%20health%20care%20interest"',
    ],
  ],
  [
    "/foundation",
    [
      'href="https://www.zeffy.com/embed/donation-form/the-valorwell-bridge-fund?modal=true"',
      "Donate to the Foundation",
      'href="/impact"',
    ],
  ],
  [
    "/impact",
    [
      "How a Donation Becomes Therapy",
      "Donor → Foundation → therapist → veteran.",
      "Real Veterans. Real Impact.",
      "For years, I was just a name on a VA waiting list.",
      'href="https://www.zeffy.com/embed/donation-form/the-valorwell-bridge-fund?modal=true"',
    ],
  ],
  [
    "/beyond-the-yellow",
    [
      "The Question We Should All Ask",
      "Meet the Doers",
      "The Beyond The Yellow Test",
      "Good stewardship looks exactly like obscurity from the outside.",
      "American Corporate Partners",
      'href="/network"',
    ],
  ],
  [
    "/donate",
    [
      'href="https://www.zeffy.com/embed/donation-form/the-valorwell-bridge-fund?modal=true"',
      "Fund a Session",
    ],
  ],
  [
    "/contact",
    [
      'href="/get-care"',
      'href="/clinicians"',
      'href="/partner"',
      'href="mailto:info@valorwell.org"',
    ],
  ],
  [
    "/clinicians",
    [
      "You handle the therapy. We handle almost everything else.",
      "The ValorWell Fit Check",
      "We Trust the License",
    ],
  ],
]);

validateRouteContract();

function routeDirectory(route) {
  return route === "/" ? DIST_DIR : path.join(DIST_DIR, route.replace(/^\//, ""));
}

function routeIndexPath(route) {
  return path.join(routeDirectory(route), "index.html");
}

function routeExtensionlessPath(route) {
 return route === "/"
    ? path.join(DIST_DIR, "index.html")
    : path.join(DIST_DIR, `${route.replace(/^\//, "")}.html`);
}

function decodeHtmlText(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#039;", "'");
}

function extractTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlText(match[1].trim()) : null;
}

function assertRealPrerenderedOutput(route, filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const canonical =
    route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  const expectedRobots = route.indexable ? "index,follow" : "noindex,follow";

  if (html.includes("data-prerender-shell")) {
    throw new Error(`Legacy prerender shell remains in ${filePath}.`);
  }
  if (html.includes("JavaScript is required")) {
    throw new Error(`JavaScript-required fallback remains in ${filePath}.`);
  }
  if (route.path === "/" && html.includes("$75")) {
    throw new Error("Homepage must not contain the $75 treatment amount.");
  }
  if (route.path === "/" && /\[\[[\s\S]*?\]\]/.test(html)) {
    throw new Error("Homepage contains an unresolved [[...]] placeholder token.");
  }

  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.indexOf("</body>", rootStart);
  if (rootStart < 0 || bodyEnd < 0 || bodyEnd - rootStart < 1500) {
    throw new Error(
      `Canonical route does not contain substantial prerendered React markup: ${route.path}`,
    );
  }

  const actualTitle = extractTitle(html);
  if (actualTitle !== route.title) {
    throw new Error(
      `Canonical route title differs from the route contract: ${route.path} (expected: ${route.title}; actual: ${actualTitle ?? "missing"})`,
    );
  }
  if (!html.includes(`href="${canonical}"`)) {
    throw new Error(`Canonical link is missing or incorrect for ${route.path}.`);
  }
  if (!html.includes(`name="robots" content="${expectedRobots}"`)) {
    throw new Error(`Robots metadata differs from the route contract for ${route.path}.`);
  }

  const expectedBody = representativeBodyContent.get(route.path);
  if (expectedBody) {
    for (const text of expectedBody) {
      if (!html.includes(text)) {
        throw new Error(
          `Representative real page content is missing from ${route.path}: ${text}`,
        );
      }
    }
    if (!html.includes('type="application/ld+json"')) {
      throw new Error(`Structured data is missing from representative route ${route.path}.`);
    }
  }

  const progressiveContent = progressiveEnhancementContent.get(route.path);
  if (progressiveContent) {
    for (const content of progressiveContent) {
      if (!html.includes(content)) {
        throw new Error(
          `Progressive-enhancement content is missing from ${route.path}: ${content}`,
        );
      }
    }
  }
}

for (const route of canonicalRoutes) {
  const indexPath = routeIndexPath(route.path);
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Canonical route is missing directory-index output: ${route.path}`);
  }
  assertRealPrerenderedOutput(route, indexPath);

  if (route.path !== "/") {
    const extensionlessPath = routeExtensionlessPath(route.path);
    if (!fs.existsSync(extensionlessPath)) {
      throw new Error(`Canonical route is missing extensionless-compatible output: ${route.path}`);
    }
    assertRealPrerenderedOutput(route, extensionlessPath);
  }
}

for (const route of [
  ...redirects.map((redirect) => redirect.from),
  ...retiredRoutes,
]) {
  const directoryPath = routeDirectory(route);
  const extensionlessPath = routeExtensionlessPath(route);

  if (
    (route !== "/" && fs.existsSync(directoryPath)) ||
    fs.existsSync(extensionlessPath)
  ) {
    throw new Error(`Noncanonical route still has static output: ${route}`);
  }
}

if (!fs.existsSync(SITEMAP_PATH)) {
  throw new Error(`Expected generated sitemap at ${SITEMAP_PATH}`);
}

const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
const actualSitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, value]) => value.trim(),
);
const expectedSitemapUrls = canonicalRoutes
  .filter((route) => route.sitemap)
  .map((route) => (route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`));

if (
  actualSitemapUrls.length !== expectedSitemapUrls.length ||
  actualSitemapUrls.some((value, index) => value !== expectedSitemapUrls[index])
) {
  throw new Error(
    `Generated sitemap differs from the route contract.\nExpected: ${expectedSitemapUrls.join(", ")}\nActual: ${actualSitemapUrls.join(", ")}`,
  );
}

if (!fs.existsSync(WORKER_PATH)) {
  throw new Error(`Expected generated Cloudflare worker at ${WORKER_PATH}`);
}

if (!fs.existsSync(ASSETS_IGNORE_PATH)) {
  throw new Error(`Expected generated Cloudflare asset ignore file at ${ASSETS_IGNORE_PATH}`);
}

const assetIgnoreRules = fs
  .readFileSync(ASSETS_IGNORE_PATH, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));
if (!assetIgnoreRules.includes("_worker.js")) {
  throw new Error("Cloudflare .assetsignore must exclude _worker.js from static asset upload.");
}

if (!fs.existsSync(WRANGLER_PATH)) {
  throw new Error(`Expected Cloudflare Wrangler configuration at ${WRANGLER_PATH}`);
}

const wrangler = JSON.parse(fs.readFileSync(WRANGLER_PATH, "utf8"));
if (wrangler.main !== "./dist/_worker.js") {
  throw new Error("Wrangler main must point to ./dist/_worker.js.");
}
if (wrangler.assets?.directory !== "./dist") {
  throw new Error("Wrangler assets.directory must point to ./dist.");
}

const appRoutesSource = fs.readFileSync(APP_ROUTES_PATH, "utf8");
const generatedResourceRoutePaths = new Set(
  generatedResourceRoutes.map((route) => route.path),
);

if (generatedResourceRoutePaths.size !== generatedResourceRoutes.length) {
  throw new Error("Generated resource routes contain duplicate paths.");
}

for (const route of generatedResourceRoutes) {
  if (!route.path.startsWith("/resources/")) {
    throw new Error(`Generated resource route is outside /resources/: ${route.path}`);
  }
  const canonicalRoute = canonicalRoutes.find((candidate) => candidate.path === route.path);
  if (!canonicalRoute) {
    throw new Error(`Generated resource route is missing from the canonical contract: ${route.path}`);
  }
  if (
    canonicalRoute.title !== route.title ||
    canonicalRoute.description !== route.description ||
    canonicalRoute.h1 !== route.h1 ||
    canonicalRoute.lead !== route.lead
  ) {
    throw new Error(`Generated resource route metadata differs from the canonical contract: ${route.path}`);
  }
}

const supportsGeneratedResourceRoutes =
  appRoutesSource.includes('path="/resources/:categorySlug"') &&
  appRoutesSource.includes('path="/resources/:categorySlug/:articleSlug"') &&
  appRoutesSource.includes("AuthorityResourceDetail") &&
  appRoutesSource.includes("AuthorityResourceCategory");

for (const route of canonicalRoutes) {
  if (route.path === "/") continue;

  if (generatedResourceRoutePaths.has(route.path)) {
    if (!supportsGeneratedResourceRoutes) {
      throw new Error(
        `Generated canonical resource routes are not wired through AppRoutes.tsx: ${route.path}`,
      );
    }
    continue;
  }

  if (!appRoutesSource.includes(`"${route.path}"`)) {
    throw new Error(`Canonical route is missing from AppRoutes.tsx: ${route.path}`);
  }
}

const mainEntrySource = fs.readFileSync(MAIN_ENTRY_PATH, "utf8");
if (!mainEntrySource.includes("hydrateRoot")) {
  throw new Error("Browser entry must hydrate the prerendered root with hydrateRoot().");
}

console.log(
  `Route contract validated (${canonicalRoutes.length} canonical routes, ${redirects.length} redirects, ${retiredRoutes.length} retired routes).`,
);
