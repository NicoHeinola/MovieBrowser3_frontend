---
name: router-page-workflow
description: Add or refactor route-backed page flows in this repository. Use when creating pages, wiring routes, or deciding whether behavior belongs in the router, page, component, or store.
---

# Router and Page Workflow

Use this skill when a task touches route registration, page namespaces, or route-driven UX.

## Workflow

1. Decide whether the change needs a new route or only a change inside an existing page.
2. Keep route declarations in `src/router` and point them at leaf page components in `src/pages`.
3. Keep page components focused on composition, route-level concerns, and wiring child components.
4. Move reusable UI into `src/components` and shared state into `src/stores`.
5. Validate the route path, lazy-loading shape, and resulting page structure.

## Boundary Checks

- Router files should not absorb page rendering logic.
- Page files should not become ad hoc route tables.
- If multiple pages share feature logic, create a shared component or store instead of duplicating it.

## Completion Checklist

- Route ownership is clear.
- Page namespace placement is coherent.
- Reusable UI was extracted where appropriate.
- Any route-specific tests or manual verification steps were identified.
