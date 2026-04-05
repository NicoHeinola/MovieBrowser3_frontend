---
name: store-api-integration
description: Wire backend data into the frontend using interfaces, stores, and Vue components. Use when adding API-backed features, introducing Pinia state, or moving data orchestration out of pages.
---

# Store and API Integration

Use this skill when a feature needs typed backend data and client-side orchestration.

## Workflow

1. Define or update backend-facing contracts in `src/interfaces/api`.
2. Preserve backend field names exactly in those contracts.
3. Add or update a Pinia store to own fetching, caching, and mutations.
4. Keep components focused on consuming store state and dispatching events.
5. Add targeted tests around parsing, mapping, or store behavior when logic grows.

## Boundaries

- Do not scatter fetch or mapping logic across multiple pages.
- Do not hide API field shape differences inside component templates.
- If a UI-friendly shape is needed, create an explicit mapping step instead of silently mutating the API interface.

## Completion Checklist

- Contracts are typed explicitly.
- Store ownership is clear.
- Components remain presentational where possible.
- Null and loading states were considered.
