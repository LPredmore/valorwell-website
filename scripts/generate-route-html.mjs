import fs from "node:fs";
import path from "node:path";
import {
  SITE_URL,
  canonicalRoutes,
  validateRouteContract,
} from "../site-route-contract.mjs";
import { loadPrerenderRenderer } from "./load-prerender-renderer.mjs";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function upsertHeadTag(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace("</head>", `    ${replacement}\n  </head>`);
}

function replaceMeta(html, attribute, key, value) {
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${escapeRegExp(key)}["'])[^>]*>`,
    "i",
  );
  return upsertHeadTag(
    html,
    pattern,
    `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}" />`,
  );
}

function replaceTitle(html, title) {
  return upsertHeadTag(
    html,
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
  );
}

function replaceCanonical(html, canonical) {
  return upsertHeadTag(
    html,
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
  );
}

function stripHeadTagsReplacedByHelmet(html, helmetHead) {
  let next = html;

  if (/<title\b/i.test(helmetHead)) {
    next = next.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "");
  }

  for (const [, metaTag] of helmetHead.matchAll(/(<meta\b[^>]*>)/gi)) {
    const identity = metaTag.match(/\b(name|property)=["']([^"']+)["']/i);
    if (!identity) continue;

    const [, attribute, key] = identity;
    next = next.replace(
      new RegExp(
        `<meta\\b(?=[^>]*\\b${attribute}=["']${escapeRegExp(key)}["'])[^>]*>`,
        "gi",
      ),
      "",
    );
  }

  if (/<link\b(?=[^>]*\brel=["']canonical["'])/i.test(helmetHead)) {
    next = next.replace(
      /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi,
      "",
    );
  }

  return next;
}

function mergeElementAttributes(html, elementName, serializedAttributes) {
  const attributes = serializedAttributes.trim();
  if (!attributes) return html;

  return html.replace(
    new RegExp(`<${elementName}\\b([^>]*)>`, "i"),
    `<${elementName}$1 ${attributes}>`,
  );
}

function renderRoute(baseHtml, route, result) {
  if (
    !result ||
    typeof result.html !== "string" ||
    typeof result.head !== "string"
  ) {
    throw new Error(`Server renderer returned an invalid result for ${route.path}.`);
  }

  const canonical = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  let html = stripHeadTagsReplacedByHelmet(baseHtml, result.head);

  if (result.head.trim()) {
    html = html.replace("</head>", `    ${result.head}\n  </head>`);
  }

  // The route contract remains authoritative for canonical routing metadata.
  // Helmet contributes the page's structured data and any additional head tags.
  html = replaceTitle(html, route.title);
  html = replaceCanonical(html, canonical);
  html = replaceMeta(html, "name", "description", route.description);
  html = replaceMeta(
    html,
    "name",
    "robots",
    route.indexable ? "index,follow" : "noindex,follow",
  );
  html = replaceMeta(html, "property", "og:title", route.title);
  html = replaceMeta(html, "property", "og:description", route.description);
  html = replaceMeta(html, "property", "og:url", canonical);
  html = replaceMeta(html, "name", "twitter:title", route.title);
  html = replaceMeta(html, "name", "twitter:description", route.description);

  html = mergeElementAttributes(html, "html", result.htmlAttributes ?? "");
  html = mergeElementAttributes(html, "body", result.bodyAttributes ?? "");

  const rootPattern = /<div\s+id=["']root["']\s*><\/div>/i;
  if (!rootPattern.test(html)) {
    throw new Error(`Could not locate the empty #root while generating ${route.path}.`);
  }

  return html.replace(rootPattern, `<div id="root">${result.html}</div>`);
}

if (!fs.existsSync(INDEX_PATH)) {
  throw new Error(`Expected Vite build output at ${INDEX_PATH}`);
}

validateRouteContract();

const baseHtml = fs.readFileSync(INDEX_PATH, "utf8");
const server = await loadPrerenderRenderer("production-prerender");

try {
  for (const route of canonicalRoutes) {
    const result = server.render(route.path);
    const html = renderRoute(baseHtml, route, result);
    const routeDirectory =
      route.path === "/"
        ? DIST_DIR
        : path.join(DIST_DIR, route.path.replace(/^\//, ""));

    fs.mkdirSync(routeDirectory, { recursive: true });
    fs.writeFileSync(path.join(routeDirectory, "index.html"), html, "utf8");
  }
} finally {
  server.cleanup();
}

const indexableCount = canonicalRoutes.filter((route) => route.indexable).length;
const noindexCount = canonicalRoutes.length - indexableCount;
console.log(
  `Prerendered real React HTML for ${canonicalRoutes.length} canonical routes (${indexableCount} indexable, ${noindexCount} noindex).`,
);
