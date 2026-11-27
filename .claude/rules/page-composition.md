---
paths:
  - 'src/pages/**/*.vue'
---

# Page Composition Rules

## Layout

- Pages live at `src/pages/<access>/<name>/<Name>View.vue`, where access is `guest`, `authenticated` or `admin`.
- Pages assemble sections and wire route state. Reusable cards, banners, navigation blocks and repeated markup go in namespaced components under `src/components`.
- Start with `<page-background />` and `<page-container>`, then lay out `titled-section`s in `v-row` and `v-col`. Pages without navigation (login, setup) use `<movie-background />` instead of `<page-background />`, so their `glass-panel` cards have something to show through.
- A page split into tabs must not jump when they switch. Give every tab's `v-row` the same `gap`, because Vuetify uses a row's own gap as the margin above it, and keep the section header buttons one size (a round icon button is taller than a text button).
- A tab that should reopen next time uses `useStoredTab` (`src/composables/tab`).

## Data

- Mutations that take several requests, recover from errors or keep state while they run belong in a composable (`useShowSections` saves the section order), or in a store under `src/stores` when the state outlives the page. A single service call after a dialog or button stays in the component.

## Search Pages

- Searchable list pages (shows, search, websites, users) share one layout. Use `search-toolbar` (search field, `sort-menu`, filter button with badge), `result-count` above the results and `search-filter-drawer`, which renders the page's filter definitions. Results shown in a table sort by its column headers instead of a `sort-menu`.
- Keep the search, filter and sort state in a `use<Domain>Search` composable built on `usePaginatedSearch` (`src/composables/search`), whether the results are cards or a table, and for a search inside a tab or panel too (the website tags, without `routeQuery`). It supplies only the domain parts (query key, list call, filters, default sort, page size) and renames `items` to the domain name. Put the sort choices in `src/data/<domain>/<domain>SortOptions.ts` and the filters' shape in `src/interfaces/<domain>/<Domain>SearchFilters.ts`.
- Define each filter once, in `src/data/<domain>/<domain>SearchFilterDefinitions.ts`, as a `SearchFilterDefinition`: a `SearchFilterType.Chips` group of include/exclude chips, a `SearchFilterType.Switch`, a `SearchFilterType.Range`, or a `SearchFilterType.Choice` for a backend that takes one value (its `emptyValue` option filters nothing, and clearing picks it). A definition holds the URL param, backend params, drawer texts and options; options that load or translate come from a `use<X>Options` composable in `src/composables/<domain>`. `createSearchFilters` (`src/utils/filter`) turns the definitions into the empty filters, backend params, active count and URL reading and writing, and takes optional default filters. Do not hand-write those or a per-domain drawer. For a backend that does not take value lists, give `api` a function. Add a new `type` only when a real filter needs another control. Sort values are backend sort strings such as `-created_at`.
- Every search page keeps its state in the URL query: the `use<Domain>Search` composable passes `routeQuery` to `usePaginatedSearch` (`q`, `sort` and `page`, plus the filter params from `createSearchFilters`). Only one search per page can do this. Changes use `router.replace`, so a `temporary` drawer that edits them needs `disable-route-watcher`.
- A search that opens on another site instead of listing results (the nyaa tab) keeps the same look: `search-toolbar` with its `submit` event (Enter) and `append` slot for the open button, and `search-filter-drawer` with `apply-text` in place of the result count.
- The empty state is an info alert. It offers "Clear filters" only when filters are active. Adding items goes through the page's floating action button, not the alert.
