import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");
const SITEMAP_PATH = path.join(DIST_DIR, "sitemap.xml");
const SITE_URL = "https://www.valorwell.org";

const routes = [
  {
    path: "/",
    title: "ValorWell | Mental Health Care for Veterans & Military Families",
    description:
      "ValorWell is a nationwide mental-health care platform for veterans and military families. The separate ValorWell Foundation pays qualified community therapists when veterans cannot reach treatment through appropriate VA channels.",
    h1: "Mental health care and support for veterans and military families.",
    lead:
      "ValorWell provides nationwide mental-health care pathways for veterans and military families. The ValorWell Foundation is a separate organization: $75 funds one therapy session, and 100% of Foundation donations go directly to therapists providing veteran treatment—not to ValorWell.",
  },
  {
    path: "/mission",
    title: "ValorWell Mission | Better Access to Mental Health Care",
    description:
      "ValorWell works to make mental-health care easier to reach for veterans and military families. The separate ValorWell Foundation pays qualified community therapists when veterans cannot reach treatment through appropriate VA channels.",
    h1: "Make mental health care and support easier to reach, understand, and use.",
    lead:
      "ValorWell builds the nationwide care platform. The separate ValorWell Foundation creates an additional funding path when a veteran still cannot reach treatment through the appropriate VA channels.",
  },
  {
    path: "/about",
    title: "About ValorWell | Care Platform & ValorWell Foundation",
    description:
      "Learn the difference between ValorWell, a nationwide mental-health care platform for veterans and military families, and the separate ValorWell Foundation, which pays qualified community therapists for veteran treatment.",
    h1: "ValorWell provides care. The ValorWell Foundation separately funds therapy.",
    lead:
      "ValorWell and the ValorWell Foundation are not the same organization. 100% of donations to the Foundation go directly to qualified mental-health therapists providing veteran treatment, and none of those donations go to ValorWell.",
  },
  {
    path: "/impact",
    title: "ValorWell Foundation Impact | $75 Funds One Therapy Session",
    description:
      "See the ValorWell Foundation's therapy impact. $75 funds one completed therapy session, and 100% of Foundation donations go directly to qualified mental-health therapists—not to ValorWell.",
    h1: "Every Foundation donation pays for therapy. None goes to ValorWell.",
    lead:
      "The ValorWell Foundation is separate from ValorWell. It pays qualified community mental-health therapists to treat veterans who cannot get seen through the appropriate VA care channels. The Foundation reports completed therapy delivered: 540+ hours, with $75 funding one session.",
  },
  {
    path: "/donate",
    title: "Donate | $75 Funds One Therapy Session | ValorWell Foundation",
    description:
      "Donate to the ValorWell Foundation, a registered 501(c)(3), EIN 93-3129745. $75 funds one completed therapy session for a veteran, and 100% of every donation pays clinicians providing that care.",
    h1: "$75 pays for one therapy session for a veteran who cannot get one.",
    lead:
      "The ValorWell Foundation is a registered 501(c)(3) nonprofit, EIN 93-3129745. Donations pay qualified mental-health clinicians in the community for treating veterans who cannot get seen through the appropriate VA care channels. 100% of each donation goes to that care, and none of it goes to ValorWell.",
  },
  {
    path: "/beyond-the-yellow",
    title: "Beyond The Yellow | Featured Organizations & Conversations",
    description:
      "Beyond The Yellow features conversations with organizations, founders, volunteers, and community leaders doing work worth knowing about.",
    h1: "Conversations with people and organizations doing work worth knowing about.",
    lead:
      "Beyond The Yellow is ValorWell's interview and feature series about programs, services, resources, and opportunities that affect people's lives.",
  },
  {
    path: "/watch",
    title: "Watch ValorWell | Veteran, Family & Beyond The Yellow Videos",
    description:
      "Watch ValorWell videos about veteran systems, CHAMPVA, VA Community Care, mental health, military families, and Beyond The Yellow conversations.",
    h1: "Videos for veterans, families, and people following the work.",
    lead:
      "ValorWell videos cover care access, CHAMPVA, VA Community Care, mental health, veteran systems, and Beyond The Yellow conversations.",
  },
  {
    path: "/network",
    title: "Beyond The Yellow Featured Organizations | ValorWell",
    description:
      "Explore organizations featured through Beyond The Yellow, read their feature pages, and watch the conversations behind their work.",
    h1: "Featured organizations.",
    lead:
      "Explore organizations featured through Beyond The Yellow, read their stories, and watch conversations about how their work operates.",
  },
  {
    path: "/get-care",
    title: "Find Mental Health Care | ValorWell",
    description:
      "Review ValorWell's current mental health care pathways for veterans and military families, including CHAMPVA and VA Community Care considerations.",
    h1: "Find the mental health care pathway that applies to you.",
    lead:
      "Start with who needs care, coverage, state, clinician availability, and the next step in ValorWell's intake process.",
  },
  {
    path: "/clinicians",
    title: "Mental Health Clinician Opportunities | ValorWell",
    description:
      "Join ValorWell's telehealth clinician network: $75 per completed session, weekly pay, flexible availability, billing support, and independent clinical judgment.",
    h1: "Provide telehealth care with a schedule you control.",
    lead:
      "ValorWell contracts with independently licensed mental health clinicians to serve veterans and military families through a telehealth-first clinical environment.",
  },
  {
    path: "/veteran-mental-health-care",
    title: "Veteran Mental Health Care | ValorWell",
    description:
      "Learn about veteran mental health care, common barriers to treatment, telehealth considerations, and ValorWell care pathways.",
    h1: "Veteran mental health care.",
    lead:
      "Mental health care for veterans can involve treatment needs alongside VA access, transition, trauma, disability, and provider availability.",
  },
  {
    path: "/va-community-care-mental-health",
    title: "VA Community Care Mental Health | ValorWell",
    description:
      "Understand VA Community Care mental health referrals, authorization, provider participation, and common access questions.",
    h1: "VA Community Care mental health.",
    lead:
      "Community Care can provide treatment outside VA when eligibility, authorization, provider participation, and availability align.",
  },
  {
    path: "/military-family-therapy",
    title: "Military Family Therapy | ValorWell",
    description:
      "Learn about therapy considerations for military families, including family stress, transitions, relationships, parenting, and care access.",
    h1: "Military family therapy.",
    lead:
      "Military family members have their own mental health needs, pressures, relationship dynamics, and barriers to care.",
  },
  {
    path: "/family-systems",
    title: "Family Systems & Mental Health | ValorWell",
    description:
      "Explore family systems concepts for communication, parenting, emotional regulation, routines, conflict repair, and household stability.",
    h1: "Family systems and mental health.",
    lead:
      "Family systems can help people understand how patterns, roles, routines, communication, and stress affect the household as a whole.",
  },
  {
    path: "/resources",
    title: "Veteran & Family Mental Health Resources | ValorWell",
    description:
      "Browse ValorWell resources on CHAMPVA, VA Community Care, veteran mental health, clinical documentation, and family systems.",
    h1: "Practical guidance for navigating care, coverage, documentation, and family systems.",
    lead:
      "ValorWell resources explain terminology, common process steps, questions to ask, and when current information should be confirmed with the responsible program or provider.",
  },
  {
    path: "/resources/champva",
    title: "CHAMPVA Mental Health Resources | ValorWell",
    description:
      "Plain-language CHAMPVA mental health resources covering provider access, telehealth, participation questions, patient responsibility, and care-pathway basics.",
    h1: "CHAMPVA mental health resources.",
    lead:
      "Use these resources to understand common CHAMPVA mental health care questions and what information to confirm before relying on a provider or payment pathway.",
  },
  {
    path: "/resources/va-community-care",
    title: "VA Community Care Mental Health Resources | ValorWell",
    description:
      "Plain-language resources for veterans navigating VA Community Care mental health referrals, authorization, access barriers, and documentation to keep.",
    h1: "VA Community Care mental health resources.",
    lead:
      "Understand the moving parts around referrals, authorization, provider availability, and community mental health care.",
  },
  {
    path: "/resources/documentation",
    title: "Mental Health Documentation Resources | ValorWell",
    description:
      "Understand treatment records, functional impact, documentation boundaries, and the role clinical documentation can play across care systems.",
    h1: "Clinical documentation resources.",
    lead:
      "Learn what mental health documentation can record, how treatment records are used, and where clinical documentation has important limits.",
  },
  {
    path: "/resources/veteran-mental-health",
    title: "Veteran Mental Health Resources | ValorWell",
    description:
      "Resources on veteran mental health, therapy access, PTSD-related concerns, family strain, transition stress, telehealth, and seeking care.",
    h1: "Veteran mental health resources.",
    lead:
      "Use these resources to understand common mental health concerns, care options, and questions that can help identify the next step.",
  },
  {
    path: "/resources/family-systems",
    title: "Family Systems Resources | ValorWell",
    description:
      "Resources on communication, parenting systems, emotional regulation, conflict repair, family meetings, and repeatable household frameworks.",
    h1: "Family systems resources.",
    lead:
      "Practical family-system resources for communication, routines, conflict repair, parenting, and household structure.",
  },
  {
    path: "/partner",
    title: "Partner With ValorWell | Referral, Community & Mission Partnerships",
    description:
      "Explore partnership opportunities with ValorWell around care access, veteran and family resources, community collaboration, Beyond The Yellow, and strategic introductions.",
    h1: "Build a partnership around a specific way to help.",
    lead:
      "ValorWell works with veteran organizations, community groups, employers, creators, clinicians, and other partners when there is a clear opportunity to improve access or connect useful resources.",
  },
  {
    path: "/support",
    title: "Support the ValorWell Foundation | $75 Funds One Therapy Session",
    description:
      "$75 funds one completed veteran therapy session through the ValorWell Foundation. 100% of Foundation donations go directly to qualified mental-health therapists, and none goes to ValorWell.",
    h1: "$75 funds one therapy session.",
    lead:
      "The ValorWell Foundation is separate from ValorWell. It pays qualified community therapists for veteran treatment when the appropriate VA care channels do not produce access, and 100% of Foundation donations go directly to those therapists.",
  },
  {
    path: "/contact",
    title: "Contact ValorWell",
    description:
      "Contact ValorWell about mental health care, partnerships, clinician opportunities, Beyond The Yellow, or other organizational questions.",
    h1: "Contact ValorWell.",
    lead:
      "Choose the topic closest to your question so it can be routed to the right part of the organization.",
  },
  {
    path: "/gallantfew",
    title: "GallantFew | Beyond The Yellow | ValorWell",
    description:
      "Explore ValorWell's Beyond The Yellow feature with GallantFew and the conversation about direction, connection, and purpose after military service.",
    h1: "GallantFew.",
    lead:
      "A Beyond The Yellow conversation about what happens when military structure and mission disappear and how veterans can build what comes next.",
  },
  {
    path: "/VOW",
    title: "Veterans Outreach of Wisconsin | Beyond The Yellow | ValorWell",
    description:
      "Explore the Beyond The Yellow feature with Veterans Outreach of Wisconsin on housing, food access, peer support, and long-term stability.",
    h1: "Veterans Outreach of Wisconsin.",
    lead:
      "A Beyond The Yellow feature about tiny homes, food access, peer support, and helping veterans rebuild stability beyond the immediate crisis.",
  },
  {
    path: "/vets2industry",
    title: "VETS2INDUSTRY | Beyond The Yellow | ValorWell",
    description:
      "Explore the Beyond The Yellow feature with VETS2INDUSTRY on helping veterans find resources, context, trusted connections, and useful pathways.",
    h1: "VETS2INDUSTRY.",
    lead:
      "A Beyond The Yellow conversation about making the military and veteran resource ecosystem easier to find and use.",
  },
  {
    path: "/mmia",
    title: "Military Missions in Action | Beyond The Yellow | ValorWell",
    description:
      "Explore the Beyond The Yellow feature with Military Missions in Action on accessibility projects, furnished homes, transportation, and practical support.",
    h1: "Military Missions in Action.",
    lead:
      "A Beyond The Yellow feature about practical support that changes what veterans and families can do next.",
  },
  {
    path: "/veteransbreakfastclub",
    title: "Veterans Breakfast Club | Beyond The Yellow | ValorWell",
    description:
      "Explore the Beyond The Yellow feature with Veterans Breakfast Club on veteran storytelling, listening, connection, and community.",
    h1: "Veterans Breakfast Club.",
    lead:
      "A Beyond The Yellow conversation about creating spaces where veterans can tell the stories they have carried and others can listen.",
  },
  {
    path: "/americancorporatepartners",
    title: "American Corporate Partners | Beyond The Yellow | ValorWell",
    description:
      "Explore ValorWell's Beyond The Yellow feature on American Corporate Partners and veteran mentorship, career transition, and professional connection.",
    h1: "American Corporate Partners.",
    lead:
      "A Beyond The Yellow feature focused on veteran mentorship, career transition, and the value of sustained professional relationships.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | ValorWell",
    description:
      "Read the ValorWell privacy policy and learn how information submitted through the public website is handled.",
    h1: "ValorWell privacy policy.",
    lead:
      "This policy describes privacy practices for information submitted through ValorWell's public website and related forms.",
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
        <noscript><p style="margin-top:2rem">JavaScript is required for the full interactive ValorWell website.</p></noscript>
      </section>
    </main>`;
}

function renderRoute(baseHtml, route) {
  const canonical = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  let html = baseHtml;

  html = replaceTitle(html, route.title);
  html = replaceCanonical(html, canonical);
  html = replaceMeta(html, "name", "description", route.description);
  html = replaceMeta(html, "name", "robots", "index,follow");
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

function parseSitemapRoutes() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    throw new Error(`Expected sitemap at ${SITEMAP_PATH}`);
  }

  const xml = fs.readFileSync(SITEMAP_PATH, "utf8");
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];

  return matches.map(([, loc]) => {
    const url = new URL(loc.trim());
    if (url.origin !== SITE_URL) {
      throw new Error(`Unexpected sitemap origin: ${url.origin}`);
    }
    return url.pathname || "/";
  });
}

function validateRouteRegistry() {
  const routePaths = routes.map((route) => route.path);
  const uniqueRoutes = new Set(routePaths);

  if (uniqueRoutes.size !== routePaths.length) {
    throw new Error("Prerender route registry contains duplicate paths.");
  }

  for (const route of routes) {
    for (const field of ["path", "title", "description", "h1", "lead"]) {
      if (!route[field]?.trim()) {
        throw new Error(`Prerender route ${route.path || "(unknown)"} is missing ${field}.`);
      }
    }
  }

  const sitemapRoutes = parseSitemapRoutes();
  const sitemapSet = new Set(sitemapRoutes);
  const missing = sitemapRoutes.filter((route) => !uniqueRoutes.has(route));
  const extra = routePaths.filter((route) => !sitemapSet.has(route));

  if (missing.length || extra.length) {
    throw new Error(
      `Prerender registry and sitemap differ. Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`,
    );
  }
}

if (!fs.existsSync(INDEX_PATH)) {
  throw new Error(`Expected Vite build output at ${INDEX_PATH}`);
}

validateRouteRegistry();

const baseHtml = fs.readFileSync(INDEX_PATH, "utf8");

for (const route of routes) {
  const html = renderRoute(baseHtml, route);
  const routeDirectory =
    route.path === "/" ? DIST_DIR : path.join(DIST_DIR, route.path.replace(/^\//, ""));

  fs.mkdirSync(routeDirectory, { recursive: true });
  fs.writeFileSync(path.join(routeDirectory, "index.html"), html, "utf8");
}

console.log(`Generated route-specific HTML for ${routes.length} sitemap routes.`);
