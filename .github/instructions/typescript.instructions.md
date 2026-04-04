---
description: Instructions for TypeScript code style and conventions.
applyTo: '**/*.ts'
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
