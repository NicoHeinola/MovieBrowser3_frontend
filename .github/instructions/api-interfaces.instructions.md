---
description: API contract file rules for src/interfaces/api. Use when adding or changing backend-facing request, response, or model interfaces.
applyTo: 'src/interfaces/api/**/*.ts'
---

# API Interface Rules

## Source of Truth

- These files represent backend contracts, so preserve backend field names exactly as they are received (e.g., use `updated_at`, not `updatedAt`).
- Do not camelCase API fields in interface definitions unless a separate mapping layer converts the payload.

## File Shape

- Keep one primary interface or type per file.
- Name the file after the exported contract, such as `Show.ts` or `ShowTitle.ts`.
- Do not create dedicated response files for simple arrays of models (e.g., use `Show[]` instead of `ShowsResponse.ts`).

### Example: Model Interface

```typescript
// src/interfaces/api/models/Setting.ts
export interface Setting {
  value: unknown; // Use unknown for dynamic types
  type: string;
  updated_at: string; // Match API's snake_case
}
```

### Example: Avoiding Redundant Response Files

```typescript
// Good: Simple array in service
const getSettings = async (): Promise<Setting[]> => { ... }

// Bad: Unnecessary wrapper interface
// src/interfaces/api/responses/SettingsResponse.ts -> export type SettingsResponse = Setting[];
```

- Always create dedicated files for complex response objects (e.g., `SettingsResponse.ts`) even when they are simple `Record` or wrapper types, as long as they represent a distinct API contract.
- Use sibling files for nested reusable contracts instead of inlining large anonymous object types repeatedly.

## Safety

- Represent nullable backend fields explicitly with `null` in the type.
- Prefer exact optionality over broad escape hatches such as `Record<string, unknown>`.
