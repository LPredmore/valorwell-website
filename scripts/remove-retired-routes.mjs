import fs from "node:fs";
import path from "node:path";
import {
  redirects,
  retiredRoutes,
  validateRouteContract,
} from "../site-route-contract.mjs";

const DIST_DIR = path.resolve(process.cwd(), "dist");

validateRouteContract();

const noncanonicalRoutes = [
  ...redirects.map((redirect) => redirect.from),
  ...retiredRoutes,
];

for (const route of noncanonicalRoutes) {
  const relativeRoute = route.replace(/^\//, "");
  const routeDirectory = path.join(DIST_DIR, relativeRoute);
  const extensionlessPath = path.join(DIST_DIR, `${relativeRoute}.html`);

  fs.rmSync(routeDirectory, { recursive: true, force: true });
  fs.rmSync(extensionlessPath, { force: true });

  if (fs.existsSync(routeDirectory) || fs.existsSync(extensionlessPath)) {
    throw new Error(`Noncanonical route output still exists for ${route}`);
  }
}

console.log(
  `Removed static output for ${noncanonicalRoutes.length} redirect/retired routes.`,
);
