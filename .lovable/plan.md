# Diagnosis: prerendered pages are deployed but not being served

## What is actually live

Checked the live site directly (no changes made):

- `https://valorwell.org/get-care.html` returns HTTP 200 with the new title **"Find Mental Health Care | ValorWell"**.
- `https://valorwell.org/get-care` (and `/clinicians`, `/partner`, `www.` variants) returns the generic app shell title **"ValorWell | Mental Health Care for Veterans & Military Families"**.
- The homepage no longer returns the old "Better Care, Better Pathways, Real Action" title anywhere.
- All responses share one deployment id (`0fe5f737-…`), served by Cloudflare.

## What this proves

1. **Production is on the new commit.** The old title is gone site-wide.
2. **The publish pipeline does run the full `package.json` build, including the post-build scripts.** `get-care.html` only exists because `generate-route-html.mjs` and `normalize-cloudflare-html.mjs` both ran. If the post-build steps were skipped, that file would 404.
3. **The remaining problem is purely hosting-side URL mapping.** The host does not resolve the extensionless request `/get-care` to the file `get-care.html`. Instead it applies single-page-application fallback and serves `index.html`, so crawlers see the generic shell.

## Why the current build layout is incompatible with this host

`wrangler.jsonc` describes Cloudflare Workers assets with `not_found_handling: "single-page-application"`, which is the behaviour we observe. But the extensionless-to-`.html` rewrite that `normalize-cloudflare-html.mjs` assumes is not happening. Worse, that script **deletes** `dist/<route>/index.html` after copying it to `dist/<route>.html`. The directory form is the layout most static hosts (including this one) resolve for a clean URL — so the normalization step is what removes the only variant this host would have served.

## Concrete hosting incompatibility identified

`scripts/normalize-cloudflare-html.mjs` removes `dist/<route>/index.html`. On Lovable hosting, clean URLs resolve via the directory/`index.html` form, not the sibling `.html` form.

## Proposed minimal fix (pending your approval)

- Change `scripts/normalize-cloudflare-html.mjs` to **keep both** outputs: leave `dist/<route>/index.html` in place and additionally write `dist/<route>.html`. Nothing is deleted.
- Nested routes (`/resources/champva`) keep the same treatment.
- After the change: rebuild, publish, then re-verify raw HTML for `/`, `/get-care`, `/clinicians`, `/partner`, and `/resources/champva` to confirm each returns its route-specific title.

No source or content changes beyond that one script.
