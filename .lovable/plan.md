# ValorWell Homepage Rebuild

## Scope
- Rebuild the homepage into the requested routing-focused sections while preserving the existing brand, layout, accessibility, and tracking conventions.
- Add a complete `/how-it-works` explainer page.
- Update the primary header order and register the new canonical route.
- Add targeted safeguards for exact claims, prohibited homepage content, current Beyond The Yellow episode, valid destinations, and route/header rendering.

## Implementation
1. Recompose the homepage with the split origin-story opening, exact full-width claim, three-part model, verified Foundation snapshot visualization, one current Beyond The Yellow episode, and four fully clickable routing cards.
2. Keep impact data as dated snapshot entries (`value: 540`, display `540+`) so verified future points can extend the visualization without redesign.
3. Create the How It Works page with SEO, three sequential access paths, clear Foundation separation, and situation-based routes.
4. Add `/how-it-works` to the route contract and app routing, then place it second in the primary header navigation while leaving Impact available elsewhere.
5. Add focused tests/build assertions covering exact copy, excluded `$75` and placeholder tokens, the current ACP episode/video ID, route targets, header navigation, and the new page.

## Verification
- Run the relevant tests and the repository production build command.
- Check the homepage and `/how-it-works` in a browser at mobile and desktop widths for overflow, card semantics, focus visibility, media sizing, and correct destinations.
- Confirm route-contract generation and validation complete successfully.

## Assumptions
- Reuse the strongest suitable existing candid family image after inspecting available assets; no new stock or generated imagery.
- Use the existing donation tracking component when compatible with the requested Foundation CTA.
