# Resource sheet import

The "ValorWell Website Resources (Master)" Google Sheet is the source of truth
for every page under `/resources`. The importer copies it into Billing Hub's
`website_resources` tables, and the site build turns those rows into pages.
Nobody creates resource pages in code.

```
Google Sheet ──CSV──▶ import-website-resources (Edge Function)
                        │  supabase/functions/_shared/resourceSheet.ts
                        │  parses + checks every row against the Content Spec
                        ▼
              public.import_website_resources(payload, dry_run)
                        │  one transaction; never deletes
                        ▼
  website_resources · website_resource_sources · website_resource_relations
  website_resource_groups · website_resource_redirects
                        │
                        ▼
  npm run build → scripts/generate-resource-content.mjs → prerendered pages,
  sitemap, and 301 redirects
```

## What each sheet column becomes

| Sheet | Billing Hub |
| --- | --- |
| `category` + `slug` | the page URL `/resources/{category}/{slug}` (match key) |
| `title`, `summary`, `quick_answer`, `body_markdown` | same names |
| `main_question` | `primary_question` |
| `in_practice` | `in_practice_markdown` |
| `faq` (`Q:`/`A:` pairs) | `faq` JSON |
| `sources` (`Title \| URL` lines) | `website_resource_sources` rows |
| `related_slugs` | `website_resource_relations` rows |
| `search_phrases` | `topic_aliases` |
| `audience`, `cta` | `audience_tags`, `cta` |
| `group`, `sort_order` | `group_slug` (via the Groups tab), `sort_order` |
| `reviewed_by`, `last_reviewed` | `reviewed_by`, `last_reviewed_on` |
| `status = retired` + `redirect_to` | page archived + 301 redirect |
| Groups tab | `website_resource_groups` (hub sections) |
| Categories tab | category rows; a topic with no live pages is archived and redirects to `/resources` |

`last_updated` is never read from the sheet. The importer sets
`public_updated_at` only when a page's content actually changed.

## Which rows are published

A row is imported when its `title` is filled in, `build_status` is `drafted` or
`published`, and `status` is not `retired`. Rows that fail any check (lengths,
FAQ format, source format, allowed link domains, related pages that exist,
internal links that exist, valid group/category/cta/audience) are skipped and
listed with the reason. The rest still import. Links pointing at a skipped
row are dropped and reported as warnings.

The importer never deletes anything. Pages that aren't in the sheet are left
alone, and retired rows are archived (kept in the database) with a redirect.

## Running it

From a checkout, after downloading the Pages, Categories, and Groups tabs as
CSV:

```sh
# Check the sheet only. Nothing is sent.
npm run import:resources -- --pages Pages.csv --categories Categories.csv --groups Groups.csv

# Full import, rolled back, with a report of exactly what would change.
RESOURCE_IMPORT_URL=https://ahqauomkgflopxgnlndd.supabase.co/functions/v1/import-website-resources \
RESOURCE_IMPORT_TOKEN=... \
npm run import:resources -- --pages Pages.csv --categories Categories.csv --groups Groups.csv --dry-run

# Write it.
... --apply
```

After an apply, publish the site so the build regenerates pages, the sitemap,
and redirects. Running the same import twice changes nothing.

## One-time setup

1. Apply `supabase/billing-hub-sql/20261014_resource_sheet_import.sql` to
   Billing Hub. It only adds columns, two tables, a view column list, and the
   import function; existing pages render unchanged.
2. Deploy the `import-website-resources` function and set its secret:
   `RESOURCE_IMPORT_TOKEN` (a random string of 32+ characters).
3. Import, then publish the site. Publishing before the database change fails
   the build at `generate:resources` rather than shipping broken pages.
