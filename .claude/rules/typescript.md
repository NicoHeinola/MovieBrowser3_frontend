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

- Outside `index.ts` barrel files, export one symbol per file.
- If a file needs to expose multiple exported functions, interfaces, types, or constants, split them into sibling files named after the exported symbol.
- Keep `index.ts` focused on re-exporting a namespace's small public surface.

## Namespace Fit

- In namespaced source folders, each `.ts` file should have one clear responsibility that matches the file name.
- Shared interfaces or helper types should live beside the code that owns them unless they are reused across namespaces.
