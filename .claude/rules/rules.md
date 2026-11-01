---
description: Validation rule file rules for reusable form rules under src/rules and the feature-level *Rules.ts files that combine them. Use when creating or editing rule functions, rule signatures, or a form's getRules().
paths:
  - 'src/rules/**/*.ts'
  - 'src/components/**/*Rules.ts'
applyTo: 'src/rules/**/*.ts,src/components/**/*Rules.ts'
---

# Validation Rule File Rules

## Naming and Placement

- Keep reusable validation rules in `src/rules`.
- Name each file after the rule or signature it exports, such as `requiredRule.ts` or `stringRule.ts`.
- Split shared rule signatures into sibling type files when more than one rule uses the same contract.

## File Shape

- Export one primary rule function or type per file.
- Keep rule functions pure and synchronous.
- Return the validation result directly from the rule file instead of coupling the file to component state.

```ts
export type StringRule = (value: string) => true | string;

export const requiredRule: StringRule = (value: string) => Boolean(value) || 'This field is required';
```

## Feature Form Rules

- A form or dialog gets a sibling `<feature>Rules.ts` that exports `getRules()`. It returns `{ field: [rule, …] }` built from the shared rules in `src/rules`.

```ts
import { requiredRule } from '@/rules/requiredRule';

export const getRules = () => {
  return {
    name: [requiredRule],
    value: [requiredRule],
    icon: [],
  };
};
```
