import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const SITEMAP_PATH = path.join(DIST_DIR, "sitemap.xml");
const SITE_URL = "https://www.valorwell.org";
const retiredRoutes = ["/becomeapatient", "/support"];

for (const route of retiredRoutes) {
  const relativeRoute = route.replace(/^\//, "");
  const routeDirectory = path.join(DIST_DIR, relativeRoute);
  const extensionlessPath = path.join(DIST_DIR, `${relativeRoute}.html`);

  fs.rmSync(routeDirectory, { recursive: true, force: true });
  fs.rmSync(extensionlessPath, { force: true });

  if (fs.existsSync(routeDirectory) || fs.existsSync(extensionlessPath)) {
    throw new Error(`Retired route output still exists for ${route}`);
  }
}

if (fs.existsSync(SITEMAP_PATH)) {
  let sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");

  for (const route of retiredRoutes) {
    const escapedUrl = `${SITE_URL}${route}`.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    sitemap = sitemap.replace(
      new RegExp(`\\s*<url><loc>${escapedUrl}<\\/loc><\\/url>`, "g"),
      "",
    );
  }

  sitemap = `${sitemap.trim()}\n`;
  fs.writeFileSync(SITEMAP_PATH, sitemap, "utf8");

  for (const route of retiredRoutes) {
    if (sitemap.includes(`${SITE_URL}${route}`)) {
      throw new Error(`Retired route remains in sitemap: ${route}`);
    }
  }
}

console.log(`Removed retired route output: ${retiredRoutes.join(", ")}`);
