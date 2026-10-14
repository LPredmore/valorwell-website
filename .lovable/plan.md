# Editorial Resource Article Template

## Scope
- Redesign only runtime resource article detail pages; keep shared authority and category pages unchanged.
- Preserve live Billing Hub Supabase queries, routes, SEO/schema, related-resource selection, and hidden research metadata.

## Implementation
1. Replace the lossy article parser with safe Markdown rendering that preserves heading hierarchy, inline emphasis/links, nested lists, and document order while excluding internal source/review sections and lines.
2. Build a dedicated article page with a linked breadcrumb hero, category and reading-time metadata, continuous paper reading surface, stable heading anchors, and responsive H2 table of contents.
3. Present FAQs through the existing accessible accordion, related articles as compact recommendations, and the existing care/topic actions in a concise closing area.
4. Add article-scoped print rules that remove site chrome, breadcrumbs, navigation, recommendations, and actions while producing a clean printable document.
5. Expand runtime tests for nested headings, sequence preservation, emphasis, metadata suppression, table-of-contents links, and future runtime slugs.

## Technical Details
- Add `react-markdown` with `remark-gfm`; raw HTML remains disabled.
- Keep sanitization as a preprocessing step before rendering and before reading-time/TOC calculation.
- Use semantic design tokens and article-scoped styles so non-resource authority pages retain their current appearance.

## Verification
- Run focused lint, TypeScript checking, resource tests, the full test suite, and the production build.
- Inspect the Family Systems article at mobile and desktop widths, including horizontal overflow and print-media behavior.
