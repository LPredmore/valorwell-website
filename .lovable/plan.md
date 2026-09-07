# Visual QA Report — 10 routes × 4 viewports (read-only)

Method: rendered preview in Chromium at 320x800, 390x844, 768x1024, 1440x1000. For every route/viewport I measured document clientWidth vs scrollWidth, off-viewport elements, clipped text nodes (scrollWidth > clientWidth), broken images, fixed/sticky elements at full scroll, footer bottom vs fixed-bar top, iframe sizing, and H1 scale, plus screenshot review of the first fold.

## Overall result

No horizontal overflow, no broken images, no clipped or truncated text, no footer overlap, and no missing/duplicate H1 on any of the 40 route/viewport combinations. The earlier P1 findings (clinicians overflow, get-care CTA covering the footer) remain fixed.

## Clean — no change warranted

- `/`, `/about`, `/impact`, `/support`, `/partner`, `/beyond-the-yellow`, `/network`, `/resources` at all four viewports: clientWidth = scrollWidth exactly (320/320, 390/390, 768/768, 1440/1440), single H1, type scale steps cleanly 36px → 60px → 72px, sectioned rhythm and card stacking behave (2-up at 768, single column at 320/390).
- `/clinicians` at all four viewports: no overflow at 320 or 390.
- `/get-care` at all four viewports: fixed intake bar top 732px vs footer bottom 704px at 320, and 776 vs 748 at 390 — no collision at full scroll.

## Concrete defects

### P2 — `/clinicians`, 320px: primary CTA label wraps while the arrow stays pinned far right
Evidence: "START CLINICIAN ONBOARDING" wraps to two lines with the arrow icon vertically centered at the far right edge, leaving a visibly lopsided button block versus the single-line secondary button under it.
Smallest fix: in `src/pages/Clinicians.tsx`, on the hero primary CTA, drop `justify-between` in favor of `justify-center gap-2` (or add `sm:justify-between`) so the icon sits next to the wrapped label at narrow widths.

### P3 — `/get-care`, 768px and 1440px: floating intake button hangs at the right edge, detached from the content column
Evidence: at 768 the fixed "Start CHAMPVA Intake" pill renders at x ≈ 552–748, outside the centered content column, reading as an unanchored chat-style widget rather than a page CTA.
Smallest fix: in `src/pages/GetCare.tsx`, constrain the fixed wrapper to the page container (`left-0 right-0 mx-auto max-w-6xl px-4` with the button right-aligned inside it), or hide it above `md` where the in-page CTA is already visible.

### P3 — `/get-care`, 320/390px: the fixed intake bar covers the top of the "STEP 1" card mid-scroll
Evidence: at 320 the bar occupies y 732–780 and sits over the first step card while scrolling; it clears the footer only at the very bottom of the page.
Smallest fix: add matching bottom padding to the intake section wrapper (e.g. `pb-24 md:pb-0`) in `src/pages/GetCare.tsx` so the bar never rests on interactive step content.

## Not reported

No subjective redesign suggestions, and no findings for typography, whitespace rhythm, media sizing, or card stacking, because measurements showed those consistent across all audited routes.
