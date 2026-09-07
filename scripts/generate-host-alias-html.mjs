import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const SITE_URL = "https://www.valorwell.org";

const aliases = [
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
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function writeRoute(pathname, html) {
  const relative = pathname.replace(/^\//, "");
  const directory = path.join(DIST_DIR, relative);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), html, "utf8");
  fs.writeFileSync(path.join(DIST_DIR, `${relative}.html`), html, "utf8");
}

function aliasHtml(from, to) {
  const canonical = `${SITE_URL}${to}`;
  const safeTo = escapeHtml(to);
  const jsTarget = JSON.stringify(to);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Redirecting | ValorWell</title>
    <meta name="robots" content="noindex,follow" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta http-equiv="refresh" content="0;url=${safeTo}" />
    <script>location.replace(${jsTarget} + location.search + location.hash);</script>
  </head>
  <body style="margin:0;background:#F4F1E8;color:#111814;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif">
    <main style="max-width:48rem;margin:0 auto;padding:5rem 1.5rem">
      <p style="color:#3B5147;font-size:.75rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase">ValorWell</p>
      <h1 style="font-size:2.5rem;line-height:1.05">This address has moved.</h1>
      <p style="font-size:1.1rem;line-height:1.7">Continue to the current ValorWell page.</p>
      <p><a href="${safeTo}" style="color:#3B5147;font-weight:800">Continue</a></p>
    </main>
  </body>
</html>`;
}

function retiredOcsHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Retired Page | ValorWell</title>
    <meta name="robots" content="noindex,follow" />
    <meta
      name="description"
      content="Operation Claims Success has been retired and is not a current ValorWell program."
    />
  </head>
  <body style="margin:0;background:#F4F1E8;color:#111814;font-family:'Trebuchet MS',Arial,Helvetica,sans-serif">
    <header style="border-bottom:1px solid rgba(59,81,71,.18)">
      <div style="max-width:72rem;margin:0 auto;padding:1rem 1.5rem">
        <a href="/" style="color:#111814;font-size:1.1rem;font-weight:800;text-decoration:none">VALORWELL</a>
      </div>
    </header>
    <main style="max-width:52rem;margin:0 auto;padding:5rem 1.5rem 7rem">
      <p style="color:#3B5147;font-size:.75rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase">Retired page</p>
      <h1 style="margin:1rem 0 0;font-size:clamp(2.5rem,7vw,4.75rem);line-height:1.02;letter-spacing:-.04em">Operation Claims Success has been retired.</h1>
      <p style="margin-top:1.5rem;font-size:1.125rem;line-height:1.7;color:#34443c">
        Operation Claims Success is not a current ValorWell program and is not part of the current ValorWell site architecture.
      </p>
      <div style="display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem">
        <a href="/get-care" style="display:inline-flex;min-height:44px;align-items:center;background:#3B5147;color:white;padding:.75rem 1rem;border-radius:.3rem;font-weight:800;text-decoration:none">Find Care</a>
        <a href="/resources" style="display:inline-flex;min-height:44px;align-items:center;border:1px solid rgba(59,81,71,.35);color:#3B5147;padding:.75rem 1rem;border-radius:.3rem;font-weight:800;text-decoration:none">Browse Resources</a>
        <a href="/" style="display:inline-flex;min-height:44px;align-items:center;color:#3B5147;padding:.75rem 1rem;font-weight:800">ValorWell Home</a>
      </div>
    </main>
  </body>
</html>`;
}

for (const [from, to] of aliases) {
  writeRoute(from, aliasHtml(from, to));
}

writeRoute("/operation-claims-success", retiredOcsHtml());

console.log(
  `Generated ${aliases.length} crawl-safe legacy alias pages and the retired OCS tombstone.`,
);
