import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ValorWell root element was not found.");
}

// Production builds include a small route-specific HTML shell so crawlers and
// no-JavaScript clients receive useful page metadata and content immediately.
// React owns the full interactive experience once the bundle loads.
if (root.querySelector("[data-prerender-shell]")) {
  root.replaceChildren();
}

createRoot(root).render(<App />);
