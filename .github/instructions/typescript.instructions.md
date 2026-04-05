---
description: TypeScript source file rules for files in src. Use when editing utilities, router files, plugin files, interfaces, or stores.
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

## Function Declarations

- Always use `const` arrow functions instead of `function` declarations.

```ts
// correct
export const getEnvString = (key: string): string => {
  // ...
};

// incorrect
export function getEnvString(key: string): string {
  // ...
}
```

## Imports and Types

- Keep imports grouped with external packages first and internal aliases second.
- Use `import type` for type-only imports.
- Prefer narrow exported types and helper functions over large mixed-purpose files.

## Namespace Fit

- In namespaced source folders, each `.ts` file should have one clear responsibility that matches the file name.
- Shared interfaces or helper types should live beside the code that owns them unless they are reused across namespaces.
