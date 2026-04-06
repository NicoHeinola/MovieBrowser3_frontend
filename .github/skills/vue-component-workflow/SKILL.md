---
name: vue-component-workflow
description: Add or refactor a Vue and Vuetify component in this repository. Use when creating a new component namespace, restructuring a component, splitting page markup into reusable UI, or updating a component namespace barrel and its imports.
---

# Vue Component Workflow

Use this skill for component-focused work under `src/components` or when extracting reusable UI from a page.

## Workflow

1. Check whether an existing namespace already owns the UI concept.
2. If a new namespace is needed, create a kebab-case folder with a PascalCase primary component file.
3. Keep the component focused on presentation, local state, and emitted events.
4. Move large shared types or helpers into sibling `.ts` files only when the component file becomes crowded or the type is reused.
5. If the namespace is consumed outside its own folder, verify that `index.ts` exposes the primary component and update external imports away from direct `.vue` paths in the same change.
6. For structural component refactors, use `feature-researcher` before finishing if ownership or import boundaries are unclear.
7. Keep layout choices aligned with Vuetify unless the component truly needs a measured native grid or flex layout.

## Component Boundary Rules

- Pages compose components; they should not duplicate reusable card, banner, or navigation markup.
- Components should not own global theme definitions.
- When a component starts coordinating async data or cross-page state, move that responsibility toward a store.

## Validate

- Confirm template component names are kebab-case.
- Confirm refs are not accessed with `.value` inside templates.
- Confirm styles are scoped unless intentionally shared.
- Confirm public component namespaces still expose their primary component through `index.ts`.
- Confirm external consumers are not importing the component through a direct `.vue` path.
