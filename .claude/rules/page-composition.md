---
description: Page composition rules for Vue pages under src/pages. Use when editing route-level page components or splitting page logic into reusable features.
paths:
  - 'src/pages/**/*.vue'
applyTo: 'src/pages/**/*.vue'
---

# Page Composition Rules

## Ownership

- Pages are route-level composition units.
- Keep pages focused on assembling sections, wiring route concerns, and connecting page state to child components.
- Do not let pages become the long-term home for reusable cards, banners, navigation blocks, or repeated feature markup.

## Layout

- Pages live at `src/pages/<access>/<name>/<Name>View.vue`, where access is `guest`, `authenticated` or `admin`.
- Start with `<page-background />` and `<page-container>`, then lay out `titled-section`s in `v-row` and `v-col`. Pages without navigation (login, setup) use `<movie-background />` instead of `<page-background />`, so their `glass-panel` cards have something to show through.

## File Boundaries

- Reusable sections belong in namespaced components under `src/components`; pages compose those sections rather than permanently hosting shared markup.
- Multi-component async orchestration, caching, and long-lived mutations belong in stores under `src/stores` rather than in the page file.
- Page-local read-only server state may use `useAPIQuery` directly in the page instead of a store when the data is not shared across routes.

## Boundaries

- Route registration belongs in `src/router`, not inside page files.
- Backend contracts belong in `src/interfaces/api`, not inline in page components unless the type is trivial and page-local.

## Search Pages

- Searchable list pages (shows, search, websites, users) share one layout. Use `search-toolbar` (search field, `sort-menu`, filter button with badge), `result-count` above the results and `search-filter-drawer`, which renders the page's filter definitions.
- Keep the search, filter and sort state in a `use<Domain>Search` composable built on `usePaginatedSearch` (`src/composables/search`). It supplies only the domain parts (query key, list call, filters, default sort, page size) and renames `items` to the domain name. Put the sort choices in `src/data/<domain>/<domain>SortOptions.ts` and the filters' shape in `src/interfaces/<domain>/<Domain>SearchFilters.ts`.
- Define each filter once, in `src/data/<domain>/<domain>SearchFilterDefinitions.ts`, as a `SearchFilterDefinition`: a `SearchFilterType.Chips` group of include/exclude chips or a `SearchFilterType.Switch`. A definition holds the URL param, backend params, drawer texts and options; options that load or translate come from a `use<X>Options` composable in `src/composables/<domain>`. `createSearchFilters` (`src/utils/filter`) turns the definitions into the empty filters, backend params, active count and URL reading and writing, and takes optional default filters. Do not hand-write those or a per-domain drawer. For a backend that does not take value lists, give `api` a function. Add a new `type` only when a real filter needs another control. Sort values are backend sort strings such as `-created_at`.
- Every search page keeps its state in the URL query: the `use<Domain>Search` composable passes `routeQuery` to `usePaginatedSearch` (`q`, `sort` and `page`, plus the filter params from `createSearchFilters`). Only one search per page can do this. Changes use `router.replace`, so a `temporary` drawer that edits them needs `disable-route-watcher`.
- The empty state is an info alert. It offers "Clear filters" only when filters are active. Adding items goes through the page's floating action button, not the alert.

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
