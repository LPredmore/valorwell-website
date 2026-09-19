# ValorWell Resource Content Contract

This document defines the public resource-authoring contract for `public.website_resources`.

## Source of truth

- Billing Hub Supabase remains the canonical resource registry in `public.website_resources`.
- Public website reads use the read-only `public.website_resources_public` projection; internal research fields are not part of the website contract.
- `body_markdown` stores Markdoc-compatible Markdown.
- Existing schema-version-1 resources remain valid standard Markdown.
- New resources should use `content_schema_version = 2`.
- The website compiles content with Markdoc; React pages must not implement their own Markdown parser.

## Article metadata

Every published article requires:

- `title`
- `slug`
- `primary_question`
- `summary`
- `body_markdown`
- `category_slug`
- `editorial_type`
- `content_schema_version`
- `status = published`

Optional editorial metadata:

- `featured`
- `sort_order`
- `seo_title`
- `seo_description`
- `public_updated_at`
- `audience_tags`
- `topic_aliases`

Internal research metadata does not belong in the rendered body. Do not add sections such as "Sources reviewed," "Last researched," or "Authoritative sources reviewed" to schema-v2 body content.

## Heading rules

The page title is the only H1.

Article bodies begin at H2:

```md
## The issue

### A narrower distinction
```

Do not skip heading levels.

## Standard Markdown

Normal Markdown should be used for prose:

```md
## What this means

A paragraph with **important language** and *emphasis*.

- A bullet
- Another bullet

1. First step
2. Second step

> A quotation or important quoted language.

[Official program guidance](https://example.gov/)
```

Tables, fenced code blocks, links, blockquotes, ordered lists, and unordered lists are handled by Markdoc rather than page-specific parsing.

## Semantic components

Use semantic tags only when the meaning warrants a distinct presentation.

### Direct answer

```md
{% answer %}
The direct answer goes here. Keep it concise and useful.
{% /answer %}
```

An optional title is supported:

```md
{% answer title="Short answer" %}
...
{% /answer %}
```

### Key takeaways

```md
{% key-takeaways %}
- First important distinction.
- Second important distinction.
{% /key-takeaways %}
```

### Callouts

Supported tones are `note`, `warning`, `verify`, and `tip`.

```md
{% callout tone="verify" title="Verify this before acting" %}
Eligibility can depend on the beneficiary category and location.
{% /callout %}
```

### Steps

```md
{% steps title="What to do next" %}
1. Confirm the current status.
2. Gather the relevant documents.
3. Contact the responsible program.
{% /steps %}
```

### Citations

Authoritative sources are stored in `public.website_resource_sources`.

Reference a public source by its `citation_key`:

```md
TRICARE treats marriage as a Qualifying Life Event. {% cite source="source-01" /%}
```

The build fails when a schema-v2 citation points to a missing public source.

## Structured sources

`public.website_resource_sources` stores:

- citation key
- organization
- title
- URL
- source type
- source publication date when known
- verification date
- public/private visibility
- display order

Use structured sources instead of appending a source dump to `body_markdown`.

## Related resources

Use `public.website_resource_relations` when a relationship is editorially intentional.

Supported relation types:

- `related`
- `start_here`
- `next`
- `previous`

If no explicit related-resource records exist, the website may fall back to other articles in the same category.

## Editorial types

Supported values:

- `guide`
- `explainer`
- `checklist`
- `reference`

Category rows use `category`.

## Publication validation

Production builds run resource validation before the site is built.

Validation rejects critical problems such as:

- H1 headings inside article content
- invalid Markdoc syntax
- unsupported semantic-tag values
- schema-v2 heading hierarchy jumps
- unsafe JavaScript URLs or script markup
- schema-v2 internal research metadata embedded in the body
- citations to missing structured public sources
- articles whose category does not exist

Warnings may be emitted for unusually long titles or summaries.

A resource that fails validation should not be published by bypassing the validator.

## Search

The production build prerenders every published article, then Pagefind indexes only elements marked with `data-pagefind-body`.

Searchable/filterable article metadata includes:

- title
- summary
- category
- audience tags
- topic aliases
- rendered article text

The public search index is generated from public rendered content, not internal research fields.
