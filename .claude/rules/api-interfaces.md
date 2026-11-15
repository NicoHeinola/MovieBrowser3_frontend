---
description: API contract file rules for src/interfaces/api. Use when adding or changing backend-facing request, response, or model interfaces.
paths:
  - 'src/interfaces/api/**/*.ts'
applyTo: 'src/interfaces/api/**/*.ts'
---

# API Interface Rules

## Source of Truth

- These files represent backend contracts, so preserve backend field names exactly as they are received (e.g., use `updated_at`, not `updatedAt`).
- Do not camelCase API fields in interface definitions unless a separate mapping layer converts the payload.
- Do not repurpose API contract files for frontend-normalized lookup shapes such as keyed `Record`s; keep those mapped shapes outside `src/interfaces/api`, and prefer local aliases when they are small and only used in one place.

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
const list = async (): Promise<Setting[]> => { ... }

// Bad: Unnecessary wrapper interface
// src/interfaces/api/responses/SettingsResponse.ts -> export type SettingsResponse = Setting[];
```

- Always create dedicated files for complex response objects (e.g., `SettingsResponse.ts`) even when they are simple `Record` or wrapper types, as long as they represent a distinct API contract.
- Use sibling files for nested reusable contracts instead of inlining large anonymous object types repeatedly.

## User-Facing Text

- The backend sends codes, not sentences. Give a code field an enum in `src/enums/<domain>` and keep its messages in i18n (`SetupCheckResult`, `setup.checkCodes`).
- API errors are `{ code, params }` (`ApiErrorDetail`, or `ApiErrorResponse` for a failed response). A new code goes in `ApiErrorCode` and `apiErrors.codes`. `getApiErrorDetailMessage` is the one place a code becomes a message, also for errors inside a payload such as a run's `error`; `getApiErrorMessage` uses it for failed requests and never shows a response's `message`.

## Safety

- Represent nullable backend fields explicitly with `null` in the type.
- Prefer exact optionality over broad escape hatches such as `Record<string, unknown>`.
- Setting keys are the `SettingKey` enum, never raw strings. `SettingValues` maps each key to its value type (values arrive as `unknown`), and the setting service and store take only those keys, so a new setting gets an enum member and a field there first. Shapes keyed by setting, such as `SetupChecks`, use the enum members as keys.
