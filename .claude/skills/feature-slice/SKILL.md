---
name: feature-slice
description: Builds or restructures a frontend feature that spans several layers (pages, components, router, stores, services, interfaces, tests), or decides where code should live. Use when the ownership or data flow still needs mapping, when moving data orchestration out of a page, or when reorganizing files. For a standard CRUD resource like categories, use `resource-slice`.
---

# Feature Slice

The rules for each layer load when you open its files; this skill gives the order and the ownership decisions.

## Workflow

1. **Map it**: route entry, page composition, components, data source and backend contract. Read the closest existing feature first.
2. **Place each file** in an existing namespace before creating one: pages compose, components render, services call the API, stores share client state, `interfaces/api` holds backend shapes.
3. **Pick the data owner**:
   - One page, short-lived, not reused → `useAPIQuery` in the page.
   - Several components share it, or it needs cross-view mutations → Pinia store that consumes the service.
   - The UI needs a different shape → an explicit mapping step in the store, composable or page; never reshape inside the service or the template.
4. **Implement** the smallest coherent slice. Move reusable logic out of the page as you go.
5. **Check the slice for smells** and fix each one you find:
   - A page holding reusable feature markup or orchestration → a component or composable.
   - A component owning fetch or cache logic → a store or composable.
   - A store defining a backend contract → `src/interfaces/api`.
   - A theme color hard-coded in a feature component → the Vuetify theme. A density or variant repeated across components → `ComponentDefaults.ts`.
   - A catch-all utility file or a growing barrel → split it by concept.
6. **Test** new utilities and risky logic (`write-tests`).
7. Run `npm run fix`, then `npm run check`.

## Done when

- Every file has a clear owning namespace, with no new catch-all files.
- API shapes are typed with backend field names; null and loading states are handled.
- Checks pass. A refactor too large for this change is called out as a follow-up.
- A new or changed convention is recorded in the owning rule in the same change.
