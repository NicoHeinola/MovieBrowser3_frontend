---
paths:
  - 'src/composables/**/*.ts'
---

# Composable File Rules

A domain folder such as `src/composables/show` holds composables, plus support files only its own composables use:

- `useX.ts`: the composables, one per file, each focused on one stateful concern with a deliberate return value. Every function exported from `src/composables` is one: ESLint fails an exported function whose name doesn't start with `use`. Stateless helpers go to `src/utils`.
- Support types or constants that nothing outside the folder imports (tests aside). A composable's own options and return types live in its file instead (`PaginatedSearchOptions` in `usePaginatedSearch.ts`).
- Once anything else imports a support file, it moves out: types to `src/interfaces/<domain>/` (`ShowSearchFilters`), constant lists to `src/data/<domain>/` (`showSortOptions`, `showSearchFilterDefinitions`). A list that needs Vue code, such as a filter's option loader, references a `useXOptions` composable here instead of holding it.
