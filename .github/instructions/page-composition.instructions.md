---
description: Page composition rules for Vue pages under src/pages. Use when editing route-level page components or splitting page logic into reusable features.
applyTo: 'src/pages/**/*.vue'
---

# Page Composition Rules

## Ownership

- Pages are route-level composition units.
- Keep pages focused on assembling sections, wiring route concerns, and connecting page state to child components.
- Do not let pages become the long-term home for reusable cards, banners, navigation blocks, or repeated feature markup.

## Extraction Rules

- When page markup or behavior is reused or clearly reusable, move it into a namespaced component under `src/components`.
- When page code starts coordinating async state, caching, or multi-component mutations, move that logic into a store.

## Boundaries

- Route registration belongs in `src/router`, not inside page files.
- Backend contracts belong in `src/interfaces/api`, not inline in page components unless the type is trivial and page-local.
