import fs from "node:fs";
import path from "node:path";
import {
  SITE_URL,
  canonicalRoutes,
  validateRouteContract,
} from "../site-route-contract.mjs";

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
    /<title>[\s\S]*?<\/title>/i,
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

function renderShell(route) {
  return `<main data-prerender-shell aria-label="${escapeHtml(route.h1)}" style="min-height:100vh;background:#F4F1E8;color:#111814;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif">
      <header style="border-bottom:1px solid rgba(59,81,71,.18)">
        <div style="max-width:72rem;margin:0 auto;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem">
          <a href="/" style="color:#111814;font-weight:800;text-decoration:none;font-size:1.1rem">ValorWell</a>
          <nav aria-label="Primary" style="display:flex;flex-wrap:wrap;gap:1rem;font-size:.9rem">
            <a href="/about" style="color:#3B5147">About</a>
            <a href="/impact" style="color:#3B5147">Foundation Impact</a>
            <a href="/beyond-the-yellow" style="color:#3B5147">Beyond The Yellow</a>
            <a href="/resources" style="color:#3B5147">Resources</a>
            <a href="/get-care" style="color:#111814;font-weight:700">Find Care</a>
          </nav>
        </div>
      </header>
      <section style="max-width:72rem;margin:0 auto;padding:5rem 1.5rem 6rem">
        <p style="margin:0 0 1rem;color:#3B5147;font-size:.75rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase">ValorWell</p>
        <h1 style="max-width:62rem;margin:0;font-size:clamp(2.5rem,6vw,4.5rem);line-height:1.04;letter-spacing:-.035em">${escapeHtml(route.h1)}</h1>
        <p style="max-width:50rem;margin:1.5rem 0 0;font-size:1.125rem;line-height:1.7;color:#34443c">${escapeHtml(route.lead)}</p>
        <p style="margin-top:2rem"><a href="/get-care" style="display:inline-block;background:#D7A92E;color:#111814;padding:.8rem 1.1rem;border-radius:.25rem;font-weight:800;text-decoration:none">Find Care</a></p>
        <noscript><p style="margin-top:2rem">${route.indexable ? "JavaScript is required for the full interactive ValorWell website." : "JavaScript is required to continue from this page."}</p></noscript>
      </section>
    </main>`;
}

function renderRoute(baseHtml, route) {
  const canonical = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  let html = baseHtml;

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

  const rootPattern = /<div\s+id=["']root["']\s*>[\s\S]*?<\/div>/i;
  if (!rootPattern.test(html)) {
    throw new Error(`Could not locate #root while generating ${route.path}`);
  }

  return html.replace(rootPattern, `<div id="root">${renderShell(route)}</div>`);
}

if (!fs.existsSync(INDEX_PATH)) {
  throw new Error(`Expected Vite build output at ${INDEX_PATH}`);
}

validateRouteContract();

const baseHtml = fs.readFileSync(INDEX_PATH, "utf8");

for (const route of canonicalRoutes) {
  const html = renderRoute(baseHtml, route);
  const routeDirectory =
    route.path === "/" ? DIST_DIR : path.join(DIST_DIR, route.path.replace(/^\//, ""));

  fs.mkdirSync(routeDirectory, { recursive: true });
  fs.writeFileSync(path.join(routeDirectory, "index.html"), html, "utf8");
}

const indexableCount = canonicalRoutes.filter((route) => route.indexable).length;
const noindexCount = canonicalRoutes.length - indexableCount;
console.log(
  `Generated route-specific HTML for ${canonicalRoutes.length} canonical routes (${indexableCount} indexable, ${noindexCount} noindex).`,
);
