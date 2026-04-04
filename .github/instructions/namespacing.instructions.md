---
description: Enforces that all files in src (components, utils, pages, plugins, etc.) must be namespaced under a folder, with each folder exporting only a single component or function. This ensures clear boundaries, maintainability, and prevents accidental coupling of unrelated code.
applyTo: |
  src/**
---

# Naming and Structure Rules

## Namespacing Requirement

- All files in `src/components`, `src/utils`, and similar directories **must be namespaced under a folder**.
- Each folder must export **only a single component or function**.
- Do **not** place multiple unrelated components or utility functions in the same folder.
- The folder name should match the component or function name (PascalCase for components, camelCase for utilities).
- Example structure:

```
src/
  components/
    MyButton/
      MyButton.vue
      index.ts
  utils/
    formatDate/
      formatDate.ts
      index.ts
```

- The `index.ts` file should re-export the main component or function for that namespace.

## Rationale

- This structure enforces clear boundaries, improves maintainability, and prevents accidental coupling of unrelated code.
- It also simplifies imports and code navigation.

## Enforcement

- PRs that do not follow this structure should be updated before merging.
