---
description: Page composition rules for Vue pages under src/pages. Use when editing route-level page components or splitting page logic into reusable features.
applyTo: 'src/pages/**/*.vue'
---

# Page Composition Rules

## Ownership

- Pages are route-level composition units.
- Keep pages focused on assembling sections, wiring route concerns, and connecting page state to child components.
- Do not let pages become the long-term home for reusable cards, banners, navigation blocks, or repeated feature markup.

## File Boundaries

- Reusable sections belong in namespaced components under `src/components`; pages compose those sections rather than permanently hosting shared markup.
- Multi-component async orchestration, caching, and long-lived mutations belong in stores under `src/stores` rather than in the page file.
- Page-local read-only server state may use `useAPIQuery` directly in the page instead of a store when the data is not shared across routes.

## Boundaries

- Route registration belongs in `src/router`, not inside page files.
- Backend contracts belong in `src/interfaces/api`, not inline in page components unless the type is trivial and page-local.

## Loading States

- Pages should pass loading state into child sections and render it with Vuetify built-in `loading` props or `v-skeleton-loader`.
- Do not build page-level custom loaders, ad hoc empty-shell placeholders, or bespoke spinner layouts.

Example:

```vue
<template>
  <v-container>
    <show-banner />
    <show-grid />
  </v-container>
</template>
```
