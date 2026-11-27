---
paths:
  - 'src/**/*.ts'
---

# TypeScript Code Style

## File Exports

- Export one value per file (a function, constant, class or enum), and name the file after it. ESLint enforces this for `src/**/*.ts` (not `index.ts`, `.d.ts` or tests); type and interface exports don't count.
- The types that belong to that value live in the same file and are exported next to it: its options, parameters and return shape (`SaveItemsOptions` in `saveItems.ts`). Other files import them from there.
- A type that stands on its own, such as a domain shape several files use, gets its own file named after it. A file without a value holds one primary type.
- Constants that describe one thing together are one exported object, not a file each: a status with its label, color and icon (`MIXED_WATCH_STATUS` with `value`, `titleKey`, `color`, `icon`), a width with its height (`SHOW_GRID_CARD_SIZE`). End it with `as const` so each field keeps its literal type.
- Per-value lookups for an enum are one `Record<Enum, { … }>` table, not a getter function per field: `WATCH_STATUS_STYLES[status].color` and `.icon`. The `Record` type already makes sure every value has an entry.

```ts
// saveItems.ts
/** How `saveItems` reaches the backend. */
export interface SaveItemsOptions<T> {
  create: (item: T) => Promise<T>;
}

export const saveItems = async <T>(items: T[], options: SaveItemsOptions<T>): Promise<void> => {
  // ...
};
```

## Declarations

- Every function is a `const` arrow function, never a `function` declaration: helpers, methods and store actions alike.
- Type state, variables and derived values explicitly, with generics on Vue primitives: `ref<boolean>(false)`, `computed<number>(() => items.value.length)`, `reactive<T>({...})`.
- No `.ts` extensions in imports. Nothing enforces this: the tsconfig allows them, so watch for it.

## Comments

- Use JSDoc (`/** ... */`) for declarations: functions (at any level), props, emits, types and their fields, enum members, and state or constants declared at the top level of a module, `<script setup>` or composable.
- JSDoc describes the purpose, with a `@param` tag for each parameter, and a `@returns` tag when the function returns a value or explicitly returns `void`.
- Use `//` for comments inside logic: before statements (`if`, `await`, calls, assignments), on locals inside callbacks, handlers and watchers, and on keys of option objects passed to a call.
- In non-obvious logic (recursion, reference-equality tricks, early returns with a hidden reason), add a short `//` before each step saying what it does and why. Skip them for obvious code.

```ts
/**
 * Walks one value of the cached data.
 * @param value - The value to walk.
 * @returns The same reference when nothing changed, otherwise a copy.
 */
const patch = (value: unknown): unknown => {
  // Lists: patch every item, but only build a new array when one actually changed.
  if (Array.isArray(value)) {
    // ...
  }
};

useAPIQuery({
  queryKey: [DashboardQueryKey.AdminDashboardStats],
  // Every admin page changes these counts, so refetch them on each visit.
  staleTime: 0,
});
```
