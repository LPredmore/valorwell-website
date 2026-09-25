# Findings: real HTTP 404 on Lovable hosting (no changes made)

## Answer
No. On this project's current stack (React + Vite single-page app on Lovable hosting), a true server-level HTTP 404 for unknown page routes cannot be configured.

- Lovable hosting serves `index.html` (HTTP 200) for any path that is not a real file, so the React router can handle it.
- Lovable hosting does not read platform config files: `_worker.js`, `wrangler.jsonc`, `_redirects`, `_headers`, `netlify.toml`, `vercel.json`. The generated `dist/_worker.js` allowlist and `public/404.html` are built but never executed or used as a status fallback.
- Real 404s only occur for missing static files (e.g. a missing image/script), not page paths.

## What is fixable client-side (already in place)
- `NotFound` page renders for unknown routes and unknown/draft/mismatched resource slugs after loading.
- `noindex` meta via SEO component, so Google treats these as soft 404s and does not index them.
- Sitemap and canonicals list only real routes.
These change what users and crawlers see, not the status code.

## What changes the actual HTTP status
Requires server logic that decides the status per request. Options:
1. Migrate to TanStack Start (Lovable-supported, "/" menu -> Migrate to TanStack Start). Server rendering can return 404 for unknown routes and for resources not published in Supabase. Stays on Lovable hosting.
2. Move hosting to a platform that executes the existing Cloudflare Worker (e.g. your own Cloudflare Workers deployment using `wrangler.jsonc`). Note: the static allowlist would 404 new runtime-published resources until rebuilt unless the worker also checks Supabase. This conflicts with the current README rule to publish only via Lovable.

## Recommendation
If the soft-404 + noindex behavior is acceptable for SEO (it generally is), no change is needed. If true 404s are required, TanStack Start migration is the path that keeps Lovable hosting.
