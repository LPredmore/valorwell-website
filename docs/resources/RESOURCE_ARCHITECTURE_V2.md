# ValorWell Resource Architecture v2

ValorWell Resources is a knowledge-library system, not a blog renderer.

## Source of truth

Production Billing Hub Supabase remains the canonical content source:

- Project: Billing Hub
- Table: `public.website_resources`
- Tenant: `00000000-0000-0000-0000-000000000001`

Supporting tables:

- `public.website_resource_sources` — structured public citations and source metadata.
- `public.website_resource_relations` — explicit editorial relationships between resources.

Do not create generated article files by hand. The production build reads published content from Billing Hub and regenerates the prerender snapshot and route contract.

## Content lifecycle

1. Research the durable topic with authoritative sources.
2. Semantically deduplicate against existing `website_resources`.
3. Draft or update the canonical resource.
4. Store source records in `website_resource_sources`.
5. Add explicit relations when they improve navigation.
6. Validate the content contract.
7. Publish.
8. Production build regenerates static resource data, prerenders HTML, builds the sitemap, and creates the Pagefind index.

## Core resource fields

### Identity

- `canonical_topic_key` — internal durable semantic identity. Never change merely because wording changes.
- `slug` — stable public URL segment.
- `resource_kind` — `category` or `article`.
- `category_slug` — required for articles.

### Editorial

- `title`
- `primary_question`
- `summary`
- `body_markdown`
- `faq`
- `audience_tags`
- `topic_aliases`
- `editorial_type` — `category`, `guide`, `explainer`, `checklist`, or `reference`.
- `featured`
- `sort_order`
- `content_schema_version`

### Public metadata

- `seo_title` — optional; visible title remains `title`.
- `seo_description` — optional; falls back to `summary`.
- `published_at`
- `public_updated_at`

### Internal research metadata

- `source_urls`
- `last_researched_at`
- `coverage_status`
- `canonical_topic_key`

These fields are research/editorial metadata and must never be rendered as public article copy. Public citations belong in `website_resource_sources`.

## Markdoc content contract

`body_markdown` is authored as Markdown-compatible Markdoc.

Normal Markdown is supported:

- H2-H6 headings
- paragraphs
- strong and emphasis
- links
- ordered/unordered lists
- blockquotes
- tables
- code where genuinely required

Do not put an H1 in `body_markdown`. The resource title is the page H1.

Raw HTML is not allowed.

Do not put internal headings such as “Sources reviewed,” “Authoritative sources reviewed,” “Last researched,” or “Last reviewed” in public copy. The renderer suppresses legacy instances for backward compatibility, but new content should not create them.

### Semantic components

Use these only when their meaning applies.

#### Direct answer

```md
{% answer %}
Give the concise answer a reader needs before the deeper explanation.
{% /answer %}
```

#### Key takeaways

```md
{% key-takeaways %}
- First practical takeaway
- Second practical takeaway
{% /key-takeaways %}
```

#### Verification callout

```md
{% verify program="TRICARE" %}
Plan rules can vary by beneficiary category and location. Verify the current rule before making a coverage decision.
{% /verify %}
```

#### General callout

```md
{% callout type="warning" title="Before you pay a bill" %}
Verify whether the bill is actually the patient's responsibility.
{% /callout %}
```

Allowed types: `info`, `warning`, `tip`.

#### Step-by-step process

```md
{% steps %}
1. Confirm the current authorization.
2. Contact the responsible program.
3. Keep the written determination.
{% /steps %}
```

## Heading structure

Use a real document outline.

```text
H1 — page title, stored separately
  H2 — major section
    H3 — subsection
      H4 — rare deeper subsection
```

Do not skip heading levels. Headings must be unique enough to generate stable in-page anchors.

## Structured public sources

Every factual resource involving VA, CHAMPVA, TRICARE, federal law, regulations, insurance, military administration, or clinical claims should have appropriate structured sources.

`website_resource_sources` fields:

- `resource_id`
- `citation_key`
- `organization`
- `title`
- `url`
- `source_type`
- `source_published_at`
- `verified_at`
- `is_public`
- `display_order`

Source types:

- `official`
- `statute`
- `regulation`
- `policy`
- `clinical`
- `research`
- `other`

Prefer useful source titles. A URL alone is acceptable for legacy data but should be enriched when a resource is substantively revised.

## Resource relationships

Use `website_resource_relations` when the relationship is editorially meaningful.

Supported types:

- `start_here`
- `related`
- `next`
- `previous`

The article page uses explicit relationships first and same-category recommendations only as a fallback.

## Search

Pagefind indexes the finished prerendered HTML after the production build.

The public search index contains public article content only. It does not index internal research fields.

Search metadata includes:

- article title
- summary
- category
- public body content
- audience filters

A local in-browser fallback search exists for development environments where the Pagefind index has not yet been generated.

## Validation

Published content fails CI if it contains structural errors such as:

- H1 inside the body
- raw HTML
- duplicate heading anchors
- skipped heading levels
- malformed Markdoc tags
- invalid FAQ structure
- missing article category
- invalid editorial type
- public source records attached to unpublished resources
- literal escaped newline sequences instead of real line breaks

Warnings may be emitted for quality issues that should be improved but do not make rendering unsafe.

## Rendering and accessibility

The public experience has three coordinated levels:

1. `/resources` — searchable library, featured guidance, topic centers.
2. `/resources/:category` — category overview, recommended starting point, article cards.
3. `/resources/:category/:article` — editorial reading surface, TOC, semantic callouts, FAQ accordion, structured sources, related resources.

All interactive components use accessible React/Radix primitives. Print/PDF output hides site chrome and navigation.

## Build pipeline

The production build performs, in order:

1. generate published resource snapshot from Billing Hub;
2. validate resource content;
3. build the React application;
4. generate route/sitemap/worker artifacts;
5. prerender canonical routes;
6. build the Pagefind static search index;
7. normalize final production output;
8. validate the route contract.

This guarantees that public routing, SEO HTML, sitemap entries, and search are derived from the same published source of truth.
