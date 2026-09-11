import { routes as coreRoutes } from "./route-contract/core-routes.mjs";
import { routes as resourceRoutes } from "./route-contract/resource-routes.mjs";
import { routes as communityRoutes } from "./route-contract/community-routes.mjs";

export const SITE_URL = "https://valorwell.org";

export const canonicalRoutes = [
  ...coreRoutes,
  ...resourceRoutes,
  ...communityRoutes,
];

export const redirects = [
  {
    "from": "/videos",
    "to": "/watch"
  },
  {
    "from": "/beyondtheyellow",
    "to": "/beyond-the-yellow"
  },
  {
    "from": "/therapists",
    "to": "/clinicians"
  },
  {
    "from": "/therapy",
    "to": "/get-care"
  },
  {
    "from": "/get-started",
    "to": "/get-care"
  },
  {
    "from": "/how-it-works",
    "to": "/get-care"
  },
  {
    "from": "/partners",
    "to": "/partner"
  },
  {
    "from": "/support",
    "to": "/impact"
  },
  {
    "from": "/fund-access-to-care",
    "to": "/impact"
  },
  {
    "from": "/sponsors",
    "to": "/impact"
  },
  {
    "from": "/sponsor-care",
    "to": "/impact"
  },
  {
    "from": "/monthly-supporters",
    "to": "/impact"
  },
  {
    "from": "/funders",
    "to": "/impact"
  },
  {
    "from": "/referral-partners",
    "to": "/partner"
  },
  {
    "from": "/mission-one-pager",
    "to": "/partner"
  },
  {
    "from": "/faq",
    "to": "/contact"
  },
  {
    "from": "/urgent-help",
    "to": "/get-care"
  },
  {
    "from": "/influencer",
    "to": "/beyond-the-yellow"
  },
  {
    "from": "/authority/resources",
    "to": "/resources"
  },
  {
    "from": "/authority/resources/champva",
    "to": "/resources/champva"
  },
  {
    "from": "/authority/resources/documentation",
    "to": "/resources/documentation"
  },
  {
    "from": "/authority/resources/family-systems",
    "to": "/resources/family-systems"
  },
  {
    "from": "/authority/resources/va-community-care",
    "to": "/resources/va-community-care"
  },
  {
    "from": "/authority/resources/veteran-mental-health",
    "to": "/resources/veteran-mental-health"
  },
  {
    "from": "/authority/veteran-mental-health-care",
    "to": "/veteran-mental-health-care"
  },
  {
    "from": "/authority/va-community-care-mental-health",
    "to": "/va-community-care-mental-health"
  },
  {
    "from": "/authority/military-family-therapy",
    "to": "/military-family-therapy"
  },
  {
    "from": "/authority/family-systems",
    "to": "/family-systems"
  }
];

export const retiredRoutes = ["/becomeapatient"];

function assertAbsoluteRoute(route, label) {
  if (typeof route !== "string" || !route.startsWith("/")) {
    throw new Error(`${label} must be an absolute site path: ${route}`);
  }
  if (route !== "/" && route.endsWith("/")) {
    throw new Error(`${label} must not end with a trailing slash: ${route}`);
  }
}

export function validateRouteContract() {
  const canonicalPaths = canonicalRoutes.map((route) => route.path);
  const canonicalSet = new Set(canonicalPaths);
  if (canonicalSet.size !== canonicalPaths.length) {
    throw new Error("Canonical route contract contains duplicate paths.");
  }

  for (const route of canonicalRoutes) {
    assertAbsoluteRoute(route.path, "Canonical route");
    for (const field of ["path", "title", "description", "h1", "lead"]) {
      if (typeof route[field] !== "string" || !route[field].trim()) {
        throw new Error(`Canonical route ${route.path || "(unknown)"} is missing ${field}.`);
      }
    }
    if (typeof route.indexable !== "boolean" || typeof route.sitemap !== "boolean") {
      throw new Error(`Canonical route ${route.path} must declare indexable and sitemap booleans.`);
    }
    if (route.sitemap && !route.indexable) {
      throw new Error(`Noindex route ${route.path} cannot be included in the sitemap.`);
    }
  }

  const redirectSources = redirects.map((redirect) => redirect.from);
  const redirectSet = new Set(redirectSources);
  if (redirectSet.size !== redirectSources.length) {
    throw new Error("Redirect contract contains duplicate source paths.");
  }

  for (const redirect of redirects) {
    assertAbsoluteRoute(redirect.from, "Redirect source");
    assertAbsoluteRoute(redirect.to, "Redirect target");
    if (canonicalSet.has(redirect.from)) {
      throw new Error(`Route ${redirect.from} cannot be both canonical and a redirect source.`);
    }
    if (!canonicalSet.has(redirect.to)) {
      throw new Error(`Redirect target ${redirect.to} is not canonical.`);
    }
  }

  const retiredSet = new Set(retiredRoutes);
  if (retiredSet.size !== retiredRoutes.length) {
    throw new Error("Retired route contract contains duplicate paths.");
  }
  for (const route of retiredRoutes) {
    assertAbsoluteRoute(route, "Retired route");
    if (canonicalSet.has(route) || redirectSet.has(route)) {
      throw new Error(`Retired route ${route} overlaps another route classification.`);
    }
  }

  return {
    canonicalPaths,
    canonicalSet,
    redirectSources,
    redirectSet,
    retiredSet,
  };
}
