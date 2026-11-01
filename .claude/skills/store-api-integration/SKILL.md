---
name: store-api-integration
description: Wire backend data into the frontend using interfaces, stores, and Vue components. Use when adding API-backed features, introducing Pinia state, or moving data orchestration out of pages.
---

# Store and API Integration

Use this skill when a feature needs typed backend data and client-side orchestration.

Use it when you still need to decide whether data should stay page-local, move into a store, or gain a dedicated mapping step between API contracts and UI-facing state.

## Workflow

1. Identify the backend contract and decide whether the UI can consume it directly or needs an explicit mapping layer.
2. Keep backend-facing contracts in `src/interfaces/api` with backend field names preserved exactly.
3. Decide whether the data belongs in page-local state or a Pinia store.
4. If a store is justified, let the store own fetching, caching, and cross-component mutations.
5. Keep components focused on consuming state and dispatching events rather than owning transport logic.
6. Add targeted tests around parsing, mapping, or store behavior when logic grows.

## When To Add A Store

- Multiple components need the same backend-backed state.
- The feature needs caching, cross-view coordination, or shared mutations.
- The page would otherwise become the long-term home for orchestration logic.

## When Not To Add A Store

- The fetch is page-local, short-lived, and not reused — use `useAPIQuery` directly in the page instead.
- The feature only needs trivial request state inside one component tree.
- Introducing a store would add ceremony without shared ownership or lifecycle value.

## Boundaries

- Do not scatter fetch or mapping logic across multiple pages.
- Do not hide API field shape differences inside component templates.
- If a UI-friendly shape is needed, create an explicit mapping step instead of silently mutating the API interface.

## Completion Checklist

- Contracts are typed explicitly.
- Store ownership is clear.
- Components remain presentational where possible.
- Null and loading states were considered.
- Loading UI uses Vuetify built-in `loading` props or `v-skeleton-loader` only.
