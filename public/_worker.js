const CANONICAL_PAGES = new Set([
  "/",
  "/mission",
  "/about",
  "/impact",
  "/beyond-the-yellow",
  "/watch",
  "/network",
  "/get-care",
  "/clinicians",
  "/veteran-mental-health-care",
  "/va-community-care-mental-health",
  "/military-family-therapy",
  "/family-systems",
  "/resources",
  "/resources/champva",
  "/resources/va-community-care",
  "/resources/documentation",
  "/resources/veteran-mental-health",
  "/resources/family-systems",
  "/partner",
  "/support",
  "/contact",
  "/gallantfew",
  "/VOW",
  "/vets2industry",
  "/mmia",
  "/veteransbreakfastclub",
  "/americancorporatepartners",
  "/privacy",
  "/donate",
  "/pendulo",
]);

const LEGACY_REDIRECTS = new Map([
  ["/videos", "/watch"],
  ["/beyondtheyellow", "/beyond-the-yellow"],
  ["/therapists", "/clinicians"],
  ["/therapy", "/get-care"],
  ["/get-started", "/get-care"],
  ["/how-it-works", "/get-care"],
  ["/partners", "/partner"],
  ["/fund-access-to-care", "/support"],
  ["/sponsors", "/support"],
  ["/sponsor-care", "/support"],
  ["/monthly-supporters", "/support"],
  ["/funders", "/support"],
  ["/referral-partners", "/partner"],
  ["/mission-one-pager", "/partner"],
  ["/faq", "/contact"],
  ["/urgent-help", "/get-care"],
  ["/influencer", "/beyond-the-yellow"],
  ["/authority/resources", "/resources"],
  ["/authority/resources/champva", "/resources/champva"],
  ["/authority/resources/documentation", "/resources/documentation"],
  ["/authority/resources/family-systems", "/resources/family-systems"],
  ["/authority/resources/va-community-care", "/resources/va-community-care"],
  ["/authority/resources/veteran-mental-health", "/resources/veteran-mental-health"],
  ["/authority/veteran-mental-health-care", "/veteran-mental-health-care"],
  ["/authority/va-community-care-mental-health", "/va-community-care-mental-health"],
  ["/authority/military-family-therapy", "/military-family-therapy"],
  ["/authority/family-systems", "/family-systems"],
]);

const ASSET_PREFIXES = ["/assets/", "/brand/", "/__l5e/"];

function isAssetPath(pathname) {
  return (
    ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    /\.[a-z0-9]{1,8}$/i.test(pathname)
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
