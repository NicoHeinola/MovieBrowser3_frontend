---
description: General TypeScript source file rules for src .ts files. Use when editing utility, router, plugin, interface, service, or store modules.
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

## Export Surface

- Outside `index.ts` barrel files, export one symbol per file.
- If a file needs to expose multiple exported functions, interfaces, types, or constants, split them into sibling files named after the exported symbol.
- Keep `index.ts` focused on re-exporting a namespace's small public surface.

## Namespace Fit

- In namespaced source folders, each `.ts` file should have one clear responsibility that matches the file name.
- Shared interfaces or helper types should live beside the code that owns them unless they are reused across namespaces.
