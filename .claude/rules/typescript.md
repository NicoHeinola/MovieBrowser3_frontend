---
description: General TypeScript source file rules for src .ts files. Use when editing utility, router, plugin, interface, service, or store modules.
paths:
  - 'src/**/*.ts'
applyTo: 'src/**/*.ts'
---

# TypeScript Code Style

## No `any` Type

- Never use `any` as a type. Use proper types, generics, or `unknown` instead.

```ts
// correct
const parse = (value: unknown): string => String(value);

// incorrect
const parse = (value: any): string => String(value);
```

## File Exports

- Export one value per file (a function, constant, class or enum), and name the file after it. ESLint enforces this; type and interface exports don't count.
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

## Function and Variable Declarations

- Always use `const` arrow functions instead of `function` declarations for all functions, methods, and actions (+ `async`).
- Type state, variables, and derived values explicitly.
- Use generic syntax for Vue-like primitives: `ref<T>(...)`, `computed<T>(() => ...)` or `reactive<T>({...})`.

```ts
// correct
export const getEnvString = (key: string): string => {
  // ...
};

const isLoading = ref<boolean>(false);
const totalCount = computed<number>(() => items.value.length);

// incorrect
export function getEnvString(key: string): string {
  // ...
}

const isLoading = ref(false);
const totalCount = computed(() => items.value.length);
```

## Arrays

- Sort with `toSorted()` instead of `sort()`; ESLint enforces it, and `tsconfig.app.json` includes the `ES2023` lib for it.

## Imports and Types

- `import type` lines come first, then value imports. Within each group, external packages come before `@/` aliases, and `@/` aliases before `./` siblings. ESLint enforces the order.
- Do not add `.ts` extensions to imports.
- Import components from their namespace barrel, not from the `.vue` file. Some files currently do neither; don't copy them.
- Prefer narrow exported types and helper functions over large mixed-purpose files.

## Comments

- Use JSDoc (`/** ... */`) for declarations: functions (at any level), props, emits, types and their fields, enum members, and state or constants declared at the top level of a module, `<script setup>` or composable.
- JSDoc should describe purpose and include `@param` tags for each parameter plus an `@returns` tag when the function returns a value or explicitly returns `void`.
- Use `//` for comments inside logic: before statements (`if`, `await`, calls, assignments), on locals inside callbacks, handlers and watchers, and on keys of option objects passed to a call.
- In non-obvious logic (recursion, reference-equality tricks, early returns with a hidden reason), add a short `//` before each step saying what it does and why. Step comments also split the code into readable sections. Skip them for obvious code.

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

## Export Surface

- The one-value rule in File Exports applies to `src/**/*.ts`, excluding `index.ts` barrels, `.d.ts` files and tests; ESLint (`no-restricted-syntax`) enforces it.
- When a file would export a second value, move that value to a sibling file named after it.
- Keep `index.ts` focused on re-exporting a namespace's small public surface.

## Namespace Fit

- In namespaced source folders, each `.ts` file should have one clear responsibility that matches the file name.
- Shared interfaces or helper types should live beside the code that owns them unless they are reused across namespaces.
