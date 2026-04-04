---
description: Enforces that all files in src (components, utils, pages, plugins, etc.) must be namespaced under a folder. Each folder represents a single logical unit (component, feature, or closely related group of utilities). This ensures clear boundaries, maintainability, and prevents accidental coupling of unrelated code.
applyTo: |
  src/**
---

# Naming and Structure Rules

## Namespacing Requirement

- All files in `src/components`, `src/utils`, and similar directories **must be namespaced under a folder**.
- Each folder represents **one logical unit** — this may be a single component, a single function, or a group of closely related functions that belong together (e.g. a set of env helpers).
- Do **not** place multiple unrelated components or utility functions in the same folder.
- The folder name should reflect the logical unit (PascalCase for components, camelCase for utilities).
- Utility function files should be named in `getX` format (e.g. `getEnvString.ts`, `formatDate.ts`).
- Do **not** create an `index.ts` barrel file inside utility namespaces — import directly from the file.
- Example structure:

```
src/
  components/
    MyButton/
      MyButton.vue
  utils/
    formatDate/
      formatDate.ts
    env/
      getEnvString.ts
      getEnvNumber.ts
      getEnvArray.ts
      getEnvBoolean.ts
```

## Rationale

- This structure enforces clear boundaries, improves maintainability, and prevents accidental coupling of unrelated code.
- Grouping closely related utilities under one namespace (e.g. `env/`) avoids over-fragmentation while still keeping concerns separate.
- It also simplifies imports and code navigation.

## Enforcement

- PRs that do not follow this structure should be updated before merging.
