---
description: Composable file rules for reusable Composition API helpers under src/composables. Use when creating or editing useX composables, composable support types, or sibling helper files.
applyTo: 'src/composables/**/*.ts'
---

# Composable File Rules

## Naming and Placement

- Keep reusable composables inside a namespaced folder under `src/composables`.
- Name the primary composable file with the `useX` convention that matches the exported composable.
- Keep composable-local helper types or support files beside the composable in the same namespace when they are part of the same concern.

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
