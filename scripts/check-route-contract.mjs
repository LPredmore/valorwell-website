import fs from "node:fs";
import path from "node:path";
import {
  SITE_URL,
  canonicalRoutes,
  redirects,
  retiredRoutes,
  validateRouteContract,
} from "../site-route-contract.mjs";

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
      "Mental health care and support for veterans and military families.",
      "Foundation-funded therapy",
      "See Foundation Impact",
    ],
  ],
  [
    "/resources",
    [
      "Practical guidance for navigating care, coverage, documentation, and family systems.",
      "Clinical Documentation",
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

  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.indexOf("</body>", rootStart);
  if (rootStart < 0 || bodyEnd < 0 || bodyEnd - rootStart < 1500) {
    throw new Error(
      `Canonical route does not contain substantial prerendered React markup: ${route.path}`,
    );
  }

  if (!html.includes(`<title>${route.title}</title>`)) {
    throw new Error(`Canonical route title differs from the route contract: ${route.path}`);
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
  throw new Error("Wrangler assets.directory must remain ./dist.");
}
if (wrangler.assets?.binding !== "ASSETS") {
  throw new Error("Wrangler must expose the static asset binding as ASSETS.");
}
if (wrangler.assets?.run_worker_first !== true) {
  throw new Error("Wrangler must run the route Worker before static asset handling.");
}

const worker = fs.readFileSync(WORKER_PATH, "utf8");
if (!worker.includes("Generated from site-route-contract.mjs")) {
  throw new Error("Cloudflare worker is not generated from the route contract.");
}

for (const route of canonicalRoutes) {
  if (!worker.includes(JSON.stringify(route.path))) {
    throw new Error(`Cloudflare worker is missing canonical route ${route.path}`);
  }
}

for (const redirect of redirects) {
  if (
    !worker.includes(JSON.stringify(redirect.from)) ||
    !worker.includes(JSON.stringify(redirect.to))
  ) {
    throw new Error(
      `Cloudflare worker is missing redirect ${redirect.from} -> ${redirect.to}`,
    );
  }
}

for (const route of retiredRoutes) {
  if (worker.includes(JSON.stringify(route))) {
    throw new Error(`Cloudflare worker still contains retired route ${route}`);
  }
}

if (!fs.existsSync(APP_ROUTES_PATH)) {
  throw new Error(`Expected shared React route registry at ${APP_ROUTES_PATH}`);
}

const appRoutesSource = fs.readFileSync(APP_ROUTES_PATH, "utf8");
const routeElementBlock = appRoutesSource.match(
  /const routeElements:[\s\S]*?= \{([\s\S]*?)\n\};/,
)?.[1];
if (!routeElementBlock) {
  throw new Error("Could not locate the React route element map.");
}

const routeElementPaths = [
  ...routeElementBlock.matchAll(/^\s*"([^"]+)"\s*:/gm),
].map(([, route]) => route);
const routeElementSet = new Set(routeElementPaths);
const canonicalPathSet = new Set(canonicalRoutes.map((route) => route.path));

const missingReactRoutes = canonicalRoutes
  .map((route) => route.path)
  .filter((route) => !routeElementSet.has(route));
const unexpectedReactRoutes = routeElementPaths.filter(
  (route) => !canonicalPathSet.has(route),
);

if (routeElementSet.size !== routeElementPaths.length) {
  throw new Error("React route element map contains duplicate paths.");
}

if (missingReactRoutes.length || unexpectedReactRoutes.length) {
  throw new Error(
    `React route element map differs from the route contract. Missing: ${missingReactRoutes.join(", ") || "none"}. Unexpected: ${unexpectedReactRoutes.join(", ") || "none"}.`,
  );
}

if (!appRoutesSource.includes("canonicalRoutes.map((route)")) {
  throw new Error("React canonical routes are not sourced from the route contract.");
}
if (!appRoutesSource.includes("redirects.map((redirect)")) {
  throw new Error("React legacy redirects are not sourced from the route contract.");
}

if (!fs.existsSync(MAIN_ENTRY_PATH)) {
  throw new Error(`Expected browser entry at ${MAIN_ENTRY_PATH}`);
}
const mainEntrySource = fs.readFileSync(MAIN_ENTRY_PATH, "utf8");
if (!mainEntrySource.includes("hydrateRoot(root, app)")) {
  throw new Error("Browser entry must hydrate prerendered production markup.");
}
if (mainEntrySource.includes("replaceChildren")) {
  throw new Error("Browser entry must not discard prerendered production markup.");
}

const donateIsCanonical = canonicalPathSet.has("/donate");
const donateRedirect = redirects.some((redirect) => redirect.from === "/donate");
if (!donateIsCanonical || donateRedirect) {
  throw new Error("/donate must be canonical and must not be a redirect source.");
}

const supportRedirect = redirects.find((redirect) => redirect.from === "/support");
if (!supportRedirect || supportRedirect.to !== "/impact") {
  throw new Error("/support must remain a redirect to /impact.");
}

console.log(
  `Route contract passed: ${canonicalRoutes.length} real-prerendered canonical routes, ${redirects.length} redirects, ${retiredRoutes.length} fully retired route(s), hydration enabled, Cloudflare Worker deployment configured.`,
);
