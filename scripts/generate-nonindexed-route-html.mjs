import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");
const SITEMAP_PATH = path.join(DIST_DIR, "sitemap.xml");
const SITE_URL = "https://www.valorwell.org";

const routes = [
  {
    path: "/donate",
    title: "Donate | ValorWell",
    description:
      "Continue from ValorWell to the current donation checkout for the ValorWell Foundation.",
    h1: "Continuing to the donation checkout.",
    lead:
      "This handoff preserves donation attribution before continuing to the current ValorWell Foundation checkout.",
    hideFromSitemap: false,
  },
  {
    path: "/pendulo",
    title: "Pendulo Partner Resource | ValorWell",
    description:
      "ValorWell partner information about Pendulo, an external hypnosis application.",
    h1: "Pendulo partner resource.",
    lead:
      "This ValorWell page provides information about an external partner resource and links to Pendulo's own service.",
    hideFromSitemap: false,
  },
  {
    path: "/americancorporatepartners",
    title: "American Corporate Partners | Beyond The Yellow | ValorWell",
    description:
      "American Corporate Partners Beyond The Yellow feature page.",
    h1: "American Corporate Partners.",
    lead:
      "This Beyond The Yellow feature is not part of the currently published episode collection.",
    hideFromSitemap: true,
  },
];

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
          <a href="/get-care" style="color:#3B5147;font-weight:700">Find Care</a>
        </div>
      </header>
      <section style="max-width:72rem;margin:0 auto;padding:5rem 1.5rem 6rem">
        <p style="margin:0 0 1rem;color:#3B5147;font-size:.75rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase">ValorWell</p>
        <h1 style="max-width:62rem;margin:0;font-size:clamp(2.5rem,6vw,4.5rem);line-height:1.04;letter-spacing:-.035em">${escapeHtml(route.h1)}</h1>
        <p style="max-width:50rem;margin:1.5rem 0 0;font-size:1.125rem;line-height:1.7;color:#34443c">${escapeHtml(route.lead)}</p>
        <noscript><p style="margin-top:2rem">JavaScript is required to continue from this page.</p></noscript>
      </section>
    </main>`;
}

function renderRoute(baseHtml, route) {
  const canonical = `${SITE_URL}${route.path}`;
  let html = baseHtml;

  html = replaceTitle(html, route.title);
  html = replaceCanonical(html, canonical);
  html = replaceMeta(html, "name", "description", route.description);
  html = replaceMeta(html, "name", "robots", "noindex,follow");
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

function removeHiddenRoutesFromBuiltSitemap() {
  if (!fs.existsSync(SITEMAP_PATH)) return;

  let sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");

  for (const route of routes.filter((item) => item.hideFromSitemap)) {
    const escapedUrl = escapeRegExp(`${SITE_URL}${route.path}`);
    sitemap = sitemap.replace(
      new RegExp(`\\s*<url><loc>${escapedUrl}<\\/loc><\\/url>`, "g"),
      "",
    );
  }

  fs.writeFileSync(SITEMAP_PATH, `${sitemap.trim()}\n`, "utf8");
}

if (!fs.existsSync(INDEX_PATH)) {
  throw new Error(`Expected Vite build output at ${INDEX_PATH}`);
}

const baseHtml = fs.readFileSync(INDEX_PATH, "utf8");

for (const route of routes) {
  const html = renderRoute(baseHtml, route);
  const relativeRoute = route.path.replace(/^\//, "");
  const routeDirectory = path.join(DIST_DIR, relativeRoute);
  const extensionlessPath = path.join(DIST_DIR, `${relativeRoute}.html`);

  fs.mkdirSync(routeDirectory, { recursive: true });
  fs.writeFileSync(path.join(routeDirectory, "index.html"), html, "utf8");
  fs.writeFileSync(extensionlessPath, html, "utf8");
}

removeHiddenRoutesFromBuiltSitemap();

console.log(
  `Generated noindex HTML and extensionless-compatible HTML for ${routes.length} routes.`,
);
