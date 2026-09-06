import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const SITEMAP_PATH = path.join(DIST_DIR, "sitemap.xml");
const SITE_URL = "https://www.valorwell.org";

if (!fs.existsSync(SITEMAP_PATH)) {
  throw new Error(`Expected sitemap at ${SITEMAP_PATH}`);
}

const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(([, loc]) => {
    const url = new URL(loc.trim());
    if (url.origin !== SITE_URL) {
      throw new Error(`Unexpected sitemap origin: ${url.origin}`);
    }
    return url.pathname || "/";
  })
  .filter((route) => route !== "/");

for (const route of routes) {
  const relativeRoute = route.replace(/^\//, "");
  const sourcePath = path.join(DIST_DIR, relativeRoute, "index.html");
  const destinationPath = path.join(DIST_DIR, `${relativeRoute}.html`);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Expected prerendered route HTML at ${sourcePath}`);
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

console.log(
  `Preserved directory-index HTML and added extensionless-compatible HTML for ${routes.length} prerendered routes.`,
);
