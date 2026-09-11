import fs from "node:fs";
import path from "node:path";
import {
  SITE_URL,
  canonicalRoutes,
  redirects,
  validateRouteContract,
} from "../site-route-contract.mjs";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const SITEMAP_PATH = path.join(DIST_DIR, "sitemap.xml");
const WORKER_PATH = path.join(DIST_DIR, "_worker.js");

function renderSitemap() {
  const urls = canonicalRoutes
    .filter((route) => route.sitemap)
    .map((route) => {
      const url = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
      return `  <url><loc>${url}</loc></url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderWorker() {
  const canonicalPaths = canonicalRoutes.map((route) => route.path);
  const redirectPairs = redirects.map((redirect) => [redirect.from, redirect.to]);

  return `// Generated from site-route-contract.mjs. Do not edit directly.
const CANONICAL_PAGES = new Set(${JSON.stringify(canonicalPaths, null, 2)});

const LEGACY_REDIRECTS = new Map(${JSON.stringify(redirectPairs, null, 2)});

const ASSET_PREFIXES = ["/assets/", "/brand/", "/__l5e/"];

function isAssetPath(pathname) {
  return (
    ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    /\\.[a-z0-9]{1,8}$/i.test(pathname)
  );
}

function redirect(url, target) {
  const destination = new URL(target, url.origin);
  destination.search = url.search;
  return Response.redirect(destination.toString(), 301);
}

async function notFound(request, env) {
  const url = new URL(request.url);
  const fallbackUrl = new URL("/404.html", url.origin);
  const fallbackRequest = new Request(fallbackUrl, {
    method: "GET",
    headers: request.headers,
  });
  const fallback = await env.ASSETS.fetch(fallbackRequest);
  const headers = new Headers(fallback.headers);
  headers.set("X-Robots-Tag", "noindex, follow");
  headers.set("Cache-Control", "public, max-age=300");

  return new Response(request.method === "HEAD" ? null : fallback.body, {
    status: 404,
    statusText: "Not Found",
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method !== "GET" && request.method !== "HEAD") {
      return env.ASSETS.fetch(request);
    }

    const redirectTarget = LEGACY_REDIRECTS.get(pathname);
    if (redirectTarget) {
      return redirect(url, redirectTarget);
    }

    if (pathname !== "/" && pathname.endsWith("/")) {
      const withoutTrailingSlash = pathname.slice(0, -1);
      const legacyTarget = LEGACY_REDIRECTS.get(withoutTrailingSlash);
      if (legacyTarget) {
        return redirect(url, legacyTarget);
      }
      if (CANONICAL_PAGES.has(withoutTrailingSlash)) {
        return redirect(url, withoutTrailingSlash);
      }
    }

    if (CANONICAL_PAGES.has(pathname) || isAssetPath(pathname)) {
      return env.ASSETS.fetch(request);
    }

    return notFound(request, env);
  },
};
`;
}

if (!fs.existsSync(DIST_DIR)) {
  throw new Error(`Expected Vite build output at ${DIST_DIR}`);
}

validateRouteContract();

fs.writeFileSync(SITEMAP_PATH, renderSitemap(), "utf8");
fs.writeFileSync(WORKER_PATH, renderWorker(), "utf8");

console.log(
  `Generated sitemap and Cloudflare worker from the route contract (${canonicalRoutes.length} canonical routes, ${redirects.length} redirects).`,
);
