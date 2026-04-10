---
description: Service namespace rules for TypeScript service files under src/services. Use when adding or refactoring API wrapper services, backend-facing service modules, or platform integration services.
applyTo: 'src/services/**/*.ts'
---

# Service Namespace Rules

## Ownership

- Put backend-facing and platform-facing service wrappers in `src/services/<domain>/` namespaces.
- Keep stores, pages, and components consuming services rather than defining service wrappers inside those namespaces.
- Reuse an existing service domain folder when the new file talks to the same backend or platform area.

## File Shape

- Name each service file after the single service concept it exports, such as `authService.ts`.
- Keep one primary exported service per file.
- Do not add `index.ts` barrels to service namespaces unless a deliberate public boundary is needed by multiple external consumers.

## Boundaries

- Service files may depend on shared API clients, request and response interfaces, and closely related service-local helpers.
- Do not move backend contract definitions into services; import them from `src/interfaces/api`.
- Keep UI state, persistence decisions, and view-specific formatting in stores or components rather than in service modules.
