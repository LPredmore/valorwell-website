import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const SITEMAP_PATH = path.join(DIST_DIR, "sitemap.xml");
const SITE_URL = "https://www.valorwell.org";
const retiredRoutes = ["/support", "/donate"];

for (const route of retiredRoutes) {
  const relativeRoute = route.replace(/^\//, "");
  fs.rmSync(path.join(DIST_DIR, relativeRoute), { recursive: true, force: true });
  fs.rmSync(path.join(DIST_DIR, `${relativeRoute}.html`), { force: true });
}

if (fs.existsSync(SITEMAP_PATH)) {
  let sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");

  for (const route of retiredRoutes) {
    const url = `${SITE_URL}${route}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    sitemap = sitemap.replace(
      new RegExp(`\\s*<url><loc>${url}<\\/loc><\\/url>`, "g"),
      "",
    );
  }

  fs.writeFileSync(SITEMAP_PATH, `${sitemap.trim()}\n`, "utf8");
}

console.log(`Removed retired route output: ${retiredRoutes.join(", ")}`);
