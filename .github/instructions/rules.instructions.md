---
description: Validation rule file rules for reusable form rules under src/rules. Use when creating or editing rule functions, rule signatures, or sibling validation types.
applyTo: 'src/rules/**/*.ts'
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

Example:

```ts
export type StringRule = (value: string) => true | string;

export const requiredRule: StringRule = (value: string) => Boolean(value) || 'This field is required';
```
