---
description: Composable file rules for reusable Composition API helpers under src/composables. Use when creating or editing useX composables, composable support types, or sibling helper files.
paths:
  - 'src/composables/**/*.ts'
applyTo: 'src/composables/**/*.ts'
---

# Composable File Rules

## Naming and Placement

- Keep reusable composables inside a namespaced folder under `src/composables`.
- Name the primary composable file with the `useX` convention that matches the exported composable.
- Keep composable-local helper types or support files beside the composable in the same namespace when they are part of the same concern.

## What a Domain Folder Holds

A folder such as `src/composables/show` holds composables, plus support files only its own composables use:

- `useX.ts`: the composables. Every function exported from `src/composables` is one, and ESLint fails any exported function whose name doesn't start with `use`. Stateless helpers go to `src/utils`.
- Support types or constants that nothing outside the folder imports (tests aside), such as `search/PaginatedSearchOptions.ts`.
- Once anything else imports a support file, it moves out: types to `src/interfaces/<domain>/` (`ShowSearchFilters`), constant lists to `src/data/<domain>/` (`showSortOptions`, `showSearchFilterDefinitions`). A list that needs Vue code, such as a filter's option loader, references a `useXOptions` composable here instead of holding it.

Import each file directly. Composables get no `index.ts` barrels: code outside imports only `useX` files, one at a time, so a barrel would only alias them, and barrels inside one layer invite import cycles.

## File Shape

- Export one primary composable per file.
- Keep the composable focused on one reusable stateful concern.
- Return a deliberate public surface instead of exposing internal implementation details indirectly.

## Namespace Growth

- Add sibling helper files only when the composable grows enough to need named support types or extracted helpers.
- Do not add catch-all files such as `helpers.ts` or `types.ts` when a more specific sibling name is possible.

Example:

```ts
export const useCommonSnackbar = () => {
  return {
    showErrorSnackbar,
    showSuccessSnackbar,
  };
};
```
