import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";

const ROOT = process.cwd();

/**
 * Build the real React server entry into an isolated temporary directory and
 * load its render function. Keep the temporary bundle under the repository
 * root so Node can resolve Vite-externalized runtime packages from the
 * project's node_modules during the build-time import.
 */
export async function loadPrerenderRenderer(label = "prerender") {
  const tempRoot = fs.mkdtempSync(
    path.join(ROOT, `.prerender-runtime-${label}-`),
  );
  const serverDir = path.join(tempRoot, "server");
  const serverEntry = path.join(serverDir, "entry-server.js");

  try {
    await build({
      configFile: path.join(ROOT, "vite.config.ts"),
      ssr: {
        // react-helmet-async ships CommonJS in this dependency version. Bundle
        // it into the ESM output so Node does not attempt unsupported named
        // imports from an externalized CommonJS module.
        noExternal: ["react-helmet-async"],
      },
      build: {
        ssr: path.join(ROOT, "src", "entry-server.tsx"),
        outDir: serverDir,
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: "entry-server.js",
          },
        },
      },
    });

    if (!fs.existsSync(serverEntry)) {
      throw new Error(`Expected server bundle at ${serverEntry}.`);
    }

    const serverModule = await import(
      `${pathToFileURL(serverEntry).href}?${label}=${Date.now()}`
    );

    if (typeof serverModule.render !== "function") {
      throw new Error("Server bundle does not export a render(url) function.");
    }

    return {
      render: serverModule.render,
      cleanup() {
        fs.rmSync(tempRoot, { recursive: true, force: true });
      },
    };
  } catch (error) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    throw error;
  }
}
