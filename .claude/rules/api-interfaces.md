---
paths:
  - 'src/interfaces/api/**/*.ts'
---

# API Interface Rules

## Source of Truth

- These files are backend contracts: keep the field names exactly as received (`updated_at`, not `updatedAt`).
- Frontend-shaped data, such as a keyed `Record` built from a list, lives outside `src/interfaces/api`.

## File Shape

- One primary interface or type per file, named after it (`Show.ts`, `ShowTitle.ts`).
- A plain array of models gets no response file: the service returns `Show[]`, not a `ShowsResponse`. A paginated list is `PaginatedResponse<T>`; a named alias for one (`SettingsResponse = PaginatedResponse<Setting>`) is fine when several files use it. A response that is an object of its own gets its own file.
- Nested contracts that several files use go in sibling files, not repeated anonymous object types.

```typescript
// src/interfaces/api/models/Setting.ts
export interface Setting {
  value: unknown; // Dynamic per key: see SettingValues
  type: string;
  updated_at: string; // The API's snake_case, as received
}
```

## User-Facing Text

- The backend sends codes, not sentences. Give a code field an enum in `src/enums/<domain>` and keep its messages in i18n (`SetupCheckResult`, `setup.checkCodes`).
- API errors are `{ code, params }` (`ApiErrorDetail`, or `ApiErrorResponse` for a failed response). A new code goes in `ApiErrorCode` and `apiErrors.codes`. `getApiErrorDetailMessage` is the one place a code becomes a message, also for errors inside a payload such as a run's `error`; `getApiErrorMessage` uses it for failed requests and never shows a response's `message`.

## Safety

- A nullable backend field is `| null` in the type. Use exact optional fields, not `Record<string, unknown>`.
- Setting keys are the `SettingKey` enum, never raw strings. `SettingValues` maps each key to its value type (values arrive as `unknown`), and the setting service and store take only those keys, so a new setting gets an enum member and a field there first. Shapes keyed by setting, such as `SetupChecks`, use the enum members as keys.
