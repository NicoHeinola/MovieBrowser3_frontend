---
paths:
  - 'src/utils/**/*.ts'
---

# Utility Namespace Rules

- Utilities are pure helpers. Code that needs a Vue lifecycle or app wiring is a composable or a plugin.
- A namespace folder groups only closely related helpers (`env/`, `youtube/`).
- Inside a domain folder, the files of one concept go in a kebab-case sub-folder with its own `__tests__`, such as `src/utils/show/watch-status/` or `src/utils/show/query-cache/`. Start one once a concept has about three files; files that belong to no concept stay at the domain level.
- A sub-folder means "these belong together", not "these are private": its files are imported directly from anywhere.
- Every utility file that declares a function has a `__tests__/<name>.test.ts` next to it. `src/__tests__/unitTestCoverage.test.ts` fails without one.
