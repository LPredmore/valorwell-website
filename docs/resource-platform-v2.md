# ValorWell Resource Platform v2

ValorWell Resources is a structured knowledge platform, not a blog renderer.

## Source of truth

Production content lives in Billing Hub Supabase.

- Public resource records: `public.website_resources_public`
- Public source/citation records: `public.website_resource_sources`
- Curated resource relationships: `public.website_resource_relations`
- Internal research metadata remains on the protected base resource records and must not be rendered by the public website.

The website consumes only the public-safe read model.

## Content schema versions

### Version 1 — legacy Markdown

Existing published resources remain valid while the library migrates. Standard Markdown is parsed with Markdoc. Legacy source/research bookkeeping embedded in `body_markdown` is stripped from the public document because sources now have structured storage.

### Version 2 — semantic Markdoc

New or upgraded resources should use schema version 2.

The ordinary document remains readable Markdown, but important information can use semantic blocks that map to one consistent ValorWell component.

#### Direct answer

```md
{% answer %}
Give the concise answer before the deeper explanation.
{% /answer %}
```

#### Key takeaways

```md
{% takeaways %}
- First durable takeaway
- Second durable takeaway
{% /takeaways %}
```

#### Steps

```md
{% steps title="What to do next" %}
1. Confirm the current status.
2. Gather the relevant records.
3. Contact the responsible program.
{% /steps %}
```

#### Verification callout

```md
{% verify program="TRICARE" %}
Confirm the current rule for the beneficiary's exact plan and location before changing coverage.
{% /verify %}
```

#### Warning and note

```md
{% warning title="Do not cancel existing coverage yet" %}
Verify the replacement coverage first.
{% /warning %}

{% note %}
Useful context that does not require warning treatment.
{% /note %}
```

#### Definition

```md
{% definition term="Authorization" %}
The approval that defines the care VA has authorized a community provider to furnish.
{% /definition %}
```

## Editorial structure

Article pages have one H1 supplied by the database `title`. Do not place an H1 in `body_markdown`.

Use headings sequentially:

- H2 for major article sections.
- H3 for subsections inside an H2.
- H4 only when genuinely needed inside an H3.
- Do not skip heading levels.

A strong guide normally contains:

1. A concise direct answer.
2. Explanation of why the issue is confusing or commonly misunderstood.
3. Important distinctions and definitions.
4. Practical steps.
5. Common mistakes or misconceptions when useful.
6. Guidance about when the reader should verify with the responsible official program or professional.
7. FAQs stored as structured FAQ records.
8. Structured authoritative sources.

Do not add a manual "Sources," "Last researched," or "Authoritative sources reviewed" section to the body. Those are structured platform data.

## Resource metadata

Every public resource has:

- `slug`
- `title`
- `primary_question`
- `summary`
- `body_markdown`
- `content_schema_version`
- `editorial_type`
- `featured`
- `sort_order`
- optional `seo_title`
- optional `seo_description`
- `public_updated_at`
- audience tags and topic aliases

Articles also require `category_slug`.

Supported editorial types are:

- `category`
- `guide`
- `explainer`
- `checklist`
- `reference`

## Sources

Sources are separate structured records. Each source can carry:

- citation key
- organization
- source title
- URL
- source type
- source publication date
- verification date
- display order
- public/private state

The public website displays only source rows explicitly marked public and attached to a published resource.

## Related resources

Use `website_resource_relations` when editorial order matters. The public renderer respects explicit relations first and falls back to same-category resources only when no curated relation exists.

Supported relation types are:

- `related`
- `start_here`
- `next`
- `previous`

## Search

The production build prerenders resource pages and then Pagefind indexes the finished public HTML.

Only content inside `data-pagefind-body` is searchable. Internal research fields and navigation chrome are excluded.

Indexed metadata includes:

- title
- summary
- category
- editorial type
- audience tags

This means search reflects exactly what the public can read rather than querying private research data.

## Build and publishing contract

Production build order:

1. Generate public resource snapshot from Billing Hub.
2. Validate all published resource content.
3. Build the React site.
4. Generate route artifacts and prerender real resource HTML.
5. Build the Pagefind search index from the prerendered HTML.
6. Run route and positioning guardrails.

A malformed published resource must fail the build rather than quietly produce a broken page.

## Design principles

- Reading width is constrained for long-form comprehension.
- Document hierarchy is semantic, not inferred by visual cards.
- Important information uses a small vocabulary of consistent semantic components.
- FAQs are collapsible on screen and expanded in print.
- Sources are visible and scannable.
- Related resources are editorial recommendations, not arbitrary siblings.
- Search accepts ordinary user language; readers do not need to know program terminology.
- Print/PDF removes navigation and site chrome and produces a clean document.
