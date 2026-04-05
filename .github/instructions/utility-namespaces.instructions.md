---
description: Utility namespace rules for TypeScript helpers under src/utils. Use when adding or refactoring utility functions, test placement, or helper file structure.
applyTo: 'src/utils/**/*.ts'
---

# Utility Namespace Rules

## File Scope

- Utility files should keep one primary exported function or one tightly related concept.
- Name the file after the function or helper it exposes.
- Avoid broad catch-all files such as `helpers.ts`, `common.ts`, or `utils.ts`.

## Namespace Layout

- Group only closely related helpers in the same namespace folder.
- Do not add `index.ts` barrels inside utility namespaces.
- Keep pure helpers in utilities; if code starts depending on Vue component lifecycle or global application wiring, move it to a more appropriate namespace.

## Testing

- Utilities should have adjacent coverage in a `__tests__` folder within the same namespace.
- Prefer one test file per utility file.
