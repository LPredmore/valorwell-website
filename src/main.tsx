import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ValorWell root element was not found.");
}

const app = <App />;

// Production canonical routes are prerendered from the real React tree at
// build time. Hydrate that markup in place so crawlers, no-JavaScript clients,
// and interactive browsers all receive the same initial page content. Local
// development still starts from Vite's empty #root and uses a normal client
// render.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
