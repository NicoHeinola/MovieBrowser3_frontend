---
name: feature-slice
description: Build or restructure a frontend feature that spans several layers (pages, components, router, stores, services, interfaces, tests), or decide where code should live. Use when the ownership or data flow still needs mapping, when moving data orchestration out of a page, or when reorganizing files. For a standard CRUD resource like categories, use `resource-slice`.
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
5. **Test** new utilities and risky logic (`test-workflow`).
6. Run `npm run fix`, then `npm run check`.

## Smells to fix on the way

- Pages holding reusable feature markup or orchestration.
- Components owning fetch or cache logic.
- Stores defining backend contracts.
- Theme tokens hard-coded in feature components.
- Catch-all utility files or growing barrels.

## Done when

- Every file has a clear owning namespace, with no new catch-all files.
- API shapes are typed with backend field names; null and loading states are handled.
- Checks pass. A refactor too large for this change is called out as a follow-up.
- A new or changed convention is recorded in the owning rule in the same change.
