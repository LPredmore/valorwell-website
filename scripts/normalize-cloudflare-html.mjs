import fs from "node:fs";
import path from "node:path";
import {
  canonicalRoutes,
  validateRouteContract,
} from "../site-route-contract.mjs";

const DIST_DIR = path.resolve(process.cwd(), "dist");

validateRouteContract();

for (const route of canonicalRoutes.filter((item) => item.path !== "/")) {
  const relativeRoute = route.path.replace(/^\//, "");
  const sourcePath = path.join(DIST_DIR, relativeRoute, "index.html");
  const destinationPath = path.join(DIST_DIR, `${relativeRoute}.html`);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Expected prerendered route HTML at ${sourcePath}`);
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

console.log(
  `Preserved directory-index HTML and added extensionless-compatible HTML for ${canonicalRoutes.length - 1} canonical routes.`,
);
