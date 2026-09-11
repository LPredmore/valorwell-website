import fs from "node:fs";
import path from "node:path";
import { loadPrerenderRenderer } from "./load-prerender-renderer.mjs";

const ROOT = process.cwd();
const PROOF_ROOT = path.join(ROOT, ".prerender-proof");
const PAGES_DIR = path.join(PROOF_ROOT, "pages");

const expectations = [
  {
    path: "/",
    title: "ValorWell | Mental Health Care for Veterans & Military Families",
    canonical: "https://valorwell.org/",
    body: [
      "Mental health care and support for veterans and military families.",
      "Foundation-funded therapy",
      "See Foundation Impact",
    ],
  },
  {
    path: "/resources",
    title: "Veteran & Family Mental Health Resources | ValorWell",
    canonical: "https://valorwell.org/resources",
    body: [
      "Practical guidance for navigating care, coverage, documentation, and family systems.",
      "Clinical Documentation",
      "Veteran Mental Health",
      "Family Systems",
    ],
  },
  {
    path: "/clinicians",
    title: "Telehealth Mental Health Clinician Opportunities | ValorWell",
    canonical: "https://valorwell.org/clinicians",
    body: [
      "You handle the therapy. We handle almost everything else.",
      "The ValorWell Fit Check",
      "We Trust the License",
    ],
  },
  {
    path: "/get-care",
    title: "Mental Health Care for Veterans & Veteran Families | ValorWell",
    canonical: "https://valorwell.org/get-care",
    body: [
      "Start with who needs care. We will help with the path.",
      "Who needs care?",
      "Outpatient mental health care for real life, not just one diagnosis.",
    ],
  },
];

function routeDirectory(route) {
  return route === "/"
    ? PAGES_DIR
    : path.join(PAGES_DIR, route.replace(/^\/+/, ""));
}

function writeProofDocument(expectation, result) {
  const htmlAttributes = result.htmlAttributes
    ? ` ${result.htmlAttributes}`
    : "";
  const bodyAttributes = result.bodyAttributes
    ? ` ${result.bodyAttributes}`
    : "";

  const document = [
    "<!doctype html>",
    `<html${htmlAttributes}>`,
    "<head>",
    '<meta charset="UTF-8" />',
    result.head,
    "</head>",
    `<body${bodyAttributes}>`,
    `<div id="root">${result.html}</div>`,
    "</body>",
    "</html>",
    "",
  ].join("\n");

  const directory = routeDirectory(expectation.path);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), document, "utf8");
  return document;
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

function validateProof(expectation, html) {
  const failures = [];

  if (html.length < 5000) {
    failures.push(`proof HTML is unexpectedly small (${html.length} bytes)`);
  }

  const actualTitle = extractTitle(html);
  if (actualTitle !== expectation.title) {
    failures.push(
      `expected page title does not match (expected: ${expectation.title}; actual: ${actualTitle ?? "missing"})`,
    );
  }
  if (!html.includes(`href="${expectation.canonical}"`)) {
    failures.push("expected canonical link is missing");
  }
  if (!html.includes('type="application/ld+json"')) {
    failures.push("structured data is missing");
  }

  for (const bodyText of expectation.body) {
    if (!html.includes(bodyText)) {
      failures.push(`expected real page content is missing: ${bodyText}`);
    }
  }

  if (html.includes("data-prerender-shell")) {
    failures.push("fake prerender shell leaked into proof output");
  }
  if (html.includes("JavaScript is required")) {
    failures.push("JavaScript-required fallback leaked into proof output");
  }

  return failures;
}

fs.rmSync(PROOF_ROOT, { recursive: true, force: true });

const server = await loadPrerenderRenderer("proof");
const allFailures = [];

try {
  for (const expectation of expectations) {
    const result = server.render(expectation.path);
    if (
      !result ||
      typeof result.html !== "string" ||
      typeof result.head !== "string"
    ) {
      allFailures.push(
        `${expectation.path}: server renderer returned an invalid result`,
      );
      continue;
    }

    const document = writeProofDocument(expectation, result);
    for (const failure of validateProof(expectation, document)) {
      allFailures.push(`${expectation.path}: ${failure}`);
    }
  }
} finally {
  server.cleanup();
}

if (allFailures.length > 0) {
  console.error("Real React prerender proof failed:");
  for (const failure of allFailures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Real React prerender proof passed for ${expectations.length} representative routes.`,
);
