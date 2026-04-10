---
description: API contract file rules for src/interfaces/api. Use when adding or changing backend-facing request, response, or model interfaces.
applyTo: 'src/interfaces/api/**/*.ts'
---

# API Interface Rules

## Source of Truth

- These files represent backend contracts, so preserve backend field names exactly as they are received.
- Do not camelCase API fields in interface definitions unless a separate mapping layer converts the payload.

## File Shape

- Keep one primary interface or type per file.
- Name the file after the exported contract, such as `Show.ts` or `ShowTitle.ts`.
- Use sibling files for nested reusable contracts instead of inlining large anonymous object types repeatedly.

## Safety

- Represent nullable backend fields explicitly with `null` in the type.
- Prefer exact optionality over broad escape hatches such as `Record<string, unknown>`.
