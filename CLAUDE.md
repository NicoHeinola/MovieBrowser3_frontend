# CLAUDE.md

Canonical guidance lives in `.github/` (shared with Copilot). Do not duplicate it here — update the `.github` files instead.

@.github/copilot-instructions.md
@commit-message-instructions.md

## File-Scoped Instructions

Before creating or editing a file, read every `.github/instructions/*.instructions.md` whose `applyTo` glob matches it. They are not loaded automatically.

| Files                                          | Instruction files                                          |
| ---------------------------------------------- | ---------------------------------------------------------- |
| `src/**/*.ts`                                  | `typescript`                                               |
| `src/**/*.vue`                                 | `vue`, `component-layout`                                  |
| `src/pages/**/*.vue`                           | `page-composition`                                         |
| `src/components/**/*Table.vue`                 | `vuetify-data-table`                                       |
| `src/**/index.ts`                              | `index-files`                                              |
| `src/services/**`                              | `service-namespaces`                                       |
| `src/stores/**`                                | `store`                                                    |
| `src/composables/**`                           | `composables`                                              |
| `src/interfaces/api/**`                        | `api-interfaces`                                           |
| `src/rules/**`                                 | `rules`                                                    |
| `src/router/**`                                | `router`                                                   |
| `src/plugins/**`                               | `plugins` (+ `vuetify-theme` for `src/plugins/vuetify/**`) |
| `src/utils/**`                                 | `utility-namespaces`                                       |
| `src/**/__tests__/*.test.ts`                   | `testing`                                                  |
| new file/folder anywhere under `src/`          | `namespacing`                                              |
| `.github/instructions/**`, `.github/skills/**` | `authoring-instructions`, `authoring-skills`               |

## Commands

The real npm scripts (README is partly stale):

- `npm run check:types` — `vue-tsc --build --force`
- `npm run check:lint` / `npm run fix:lint` — ESLint (`eslint-config-vuetify`, enforces import order and Vue attribute order)
- `npm run check:format` / `npm run fix:format` — Prettier (single quotes, semicolons, 120 cols)
- `npm test` — Vitest once; `npx vitest run <path>` for a single file
- `npm run fix` then `npm run check` — full pass before finishing a multi-file change

## Patterns Observed in Code (not spelled out in `.github`)

- **Services**: declare `const list/get/create/update/remove` arrow functions, then `export const xService = { list, get, create, update, remove }`. Use `remove`, not `delete`. Relative paths without a leading slash (`'categories'`, `` `episodes/${id}` ``). Return `response.data`. File uploads go through `toFormData(request)` with a `multipart/form-data` header.
- **List queries**: `ApiQueryParams` (`sort: '-name'`, `filter`, `page: { number, size }`). `page: { number: 0, size: 0 }` fetches everything. Paginated endpoints return `PaginatedResponse<T>`.
- **Query keys**: string enums in `src/enums/query/<domain>QueryKey.ts`, with one member per call site (`AdminCategories`, `ShowCategoriesAutocomplete`).
- **Mutations**: there is no `useMutation`. Call the service directly inside a `try { … } catch (error: unknown) { showAPIErrorSnackbar(error) } finally { isSaving.value = false }` block, then `refetch()` the query or let the dialog result trigger it.
- **Edit dialogs** (`category-edit-dialog` is the reference):
  - Props are `defineProps<DialogComponentProps<boolean>>()`, visibility is `defineModel<boolean>({ required: true })`, and the entity is a named `defineModel`.
  - Wrap the content in `base-dialog` with `#title`, `#default` and `#actions` slots.
  - The caller passes `deepClone(entity)` or an empty entity (`id: 0`) and refetches when the dialog closes with `true`.
  - Snapshot the original in `onMounted` and skip the update when `getChangedObject(...)` returns `undefined`.
  - Confirm a delete with `useConfirmDialog().confirm({...})`.
- **Show cache patches**: changes to one show (watch progress, watch status) patch every `Object.values(ShowQueryKey)` query in place instead of refetching. The show drawer takes only `v-model:show-id` and reads its show from the `SelectedShow` query, which starts from the copy in a cached list. Don't hand it a cloned show.
- **Form rules**: a sibling `<feature>Rules.ts` exports `getRules()`, which returns `{ field: [rule, …] }` built from `src/rules/*`. Mark required inputs with `class="required"`.
- **Pages**: `src/pages/<access>/<name>/<Name>View.vue`, where access is `guest`, `authenticated` or `admin`. Route names are `<access>-<name>` with `meta.requiresAuth`, `requiresAdmin` or `guestOnly`. Add a new admin page to `adminLinks` in `TopNavigation.vue` as well. Pages start with `<page-background />` and `<page-container>`, then lay out `titled-section`s in `v-row` and `v-col`.
- **Template attribute order** (ESLint-enforced, alphabetical within each group): `v-for` → `v-model` → `:bound` → static → boolean → `@events` → `:key`/`ref` → `v-if`/`v-else` **last**.
- **Imports**: `import type` lines first, then value imports, with external packages before `@/` aliases and `@/` aliases before `./` siblings. Do not add `.ts` extensions. Import components from their namespace barrels. Some files currently do neither; don't copy them.
- **i18n**: `vue-i18n` (`src/plugins/i18n/en.json`) is used mainly for enum labels, for example `showEntry.type.*` and `showLink.type.*`. Most UI copy is still inline English.
- **Tests**: `vi.mock('@/plugins/api/apiClient', …)`, `vi.resetAllMocks()` in `beforeEach`, and a local `createResponse` helper. Assert the URL and payload with `toHaveBeenCalledWith` or `mock.calls`.

## Workflows

`.claude/skills` is a symlink to `.github/skills`, so the same skills serve Claude and Copilot. Create new skills in `.github/skills/`.

- `resource-slice`: a standard CRUD resource end-to-end (interface → service → test → query key → dialog/page → route → nav)
- `feature-slice-development`: multi-layer work whose ownership is still unclear
- `store-api-integration`: deciding between a store and `useAPIQuery`, or wiring backend data
- `structure-audit-workflow`: where code should live, moves and splits
- `test-workflow`: writing Vitest coverage
- `feature-review`: reviewing a diff, findings first

The `.github/agents/*` (planner/researcher/reviewer) map to Claude subagents only when the user asks for delegation.
