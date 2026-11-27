---
paths:
  - 'src/components/**'
  - 'src/composables/**'
  - 'src/data/**'
  - 'src/enums/**'
  - 'src/interfaces/**'
  - 'src/pages/**'
  - 'src/plugins/**'
  - 'src/router/**'
  - 'src/rules/**'
  - 'src/services/**'
  - 'src/stores/**'
  - 'src/utils/**'
---

# Naming and Structure Rules

## Where a File Goes

- Every new file under `src/` goes in a namespace folder for one logical unit, never straight into `src/components`, `src/pages`, `src/utils`, `src/plugins` or `src/services`. Reuse a namespace when the file belongs to it; start a new one for an unrelated job.
- Component and page folders are kebab-case (`show-grid`, `top-navigation`). The primary component is PascalCase and matches the folder (`ShowGrid.vue`). No `types.ts`, `helpers.ts`, `utils.ts` or `common.ts`.
- A component folder may hold private sibling `.vue` files that only its primary component uses (a dialog's tab panels, form sections). They get no folder of their own, are imported by relative path and are not exported. One that gets reused elsewhere moves to its own namespace.

## Layer Boundaries

Dependencies point one way. ESLint (`layerBoundaries` in `eslint.config.js`) fails an import that goes the wrong way; tests may import anything.

| Layer                       | Must not import                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `interfaces`, `enums`       | anything but other interfaces and enums                                                                                        |
| `data`                      | components, pages, plugins, router, services, stores (a list that needs Vue code references a composable)                      |
| `utils`, `rules`            | components, composables, pages, router, services, stores                                                                       |
| `services`                  | components, composables, data, pages, router, stores                                                                           |
| `stores`                    | components, composables, pages, router                                                                                         |
| `plugins`                   | components, composables, pages, router, stores (only `plugins/index.ts`, the startup wiring, may import stores and the router) |
| `composables`, `components` | pages                                                                                                                          |

A type that a lower layer needs lives in `src/interfaces`, not in the component or composable that first used it.

## Barrels (`index.ts`)

- A component namespace under `src/components/common`, `features` or `layouts` that is used outside its folder has an `index.ts`. It re-exports the primary component and closely related public types only. Imports from outside go through the folder, never the `.vue` file. Create or update the `index.ts` in the same change as the namespace.
- Utilities, enums, services and composables get no barrels: import each file directly. Code outside a composables folder imports one `useX` file at a time, so a barrel would only alias them, and barrels inside one layer invite import cycles.
- Anywhere else, add a barrel only for a deliberate public surface that several namespaces import.

## Enums

- Shared enums live in a folder under `src/enums` named for their concern, one enum per file, named after it (`settingQueryKey.ts`).

## Static Data

- Content that ships with the frontend instead of coming from the backend lives in `src/data/<domain>/`, one exported constant per file (`src/data/changelog/changelogEntries.ts`). Shared configuration lists count too: sort options and search filter definitions (`src/data/show/showSortOptions.ts`). Data holds no Vue code; a definition that needs some references a composable.
- A list that changes without code changes, such as the nyaa mirrors, comes from a `VITE_*` key read with `getEnvArray` (`src/utils/env`), listed in `.env.example` and `.env.production`. Tests get the production value through `test.env` in `vite.config.mts`.
- Type it with interfaces in `src/interfaces/<domain>/`, not `src/interfaces/api`, and cover its invariants (order, uniqueness, formats) in an adjacent `__tests__` file.
