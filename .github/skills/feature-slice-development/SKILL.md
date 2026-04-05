---
name: feature-slice-development
description: Build a frontend feature slice across pages, components, router, stores, interfaces, and tests. Use when a request spans multiple files or layers rather than a single isolated edit.
---

# Feature Slice Development

Use this skill when the work touches more than one of the following: page composition, reusable components, routing, client state, API contracts, theming, or tests.

## Workflow

1. Inspect the existing namespace before creating new folders.
2. Decide whether the work belongs in an existing page, feature, layout, utility, or plugin namespace.
3. Map the data flow: route entry, page composition, component responsibilities, store ownership, and API contracts.
4. Implement the smallest coherent slice.
5. Run the smallest relevant validation.

## File Placement Heuristics

- Page composition belongs in `src/pages/...`.
- Reusable UI belongs in `src/components/...`.
- Client state belongs in `src/stores/...`.
- Backend-facing contracts belong in `src/interfaces/api/...`.
- Shared theme decisions belong in `src/plugins/vuetify/...`.

## Completion Checklist

- New files respect namespace rules.
- Reusable logic is not trapped inside a page.
- API shapes are typed explicitly.
- Tests were considered for new logic or changed behavior.
- Validation was run and any remaining gaps were reported.
