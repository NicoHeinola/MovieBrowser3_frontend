---
description: Layout and composition rules for Vue components and pages that render Vuetify UI. Use when editing .vue files under src/components or src/pages.
applyTo: |
  src/components/**/*.vue
  src/pages/**/*.vue
---

# Vuetify Layout Rules

## Layout Primitives

- Prefer `v-row` and `v-col` for page and section layout instead of building the entire structure with utility flex or grid classes.
- Start from `cols="12"` and add responsive breakpoints where the layout changes.
- Use Vuetify display utilities for small alignment needs, not as a substitute for the main layout structure.

## Acceptable Exceptions

- Native CSS grid or flex is acceptable when the component is rendering a specialized layout primitive, such as a card rail, overlay, or measured grid that Vuetify grid components do not model cleanly.
- When using a native grid or flex container, keep the exception local and obvious in the component instead of mixing multiple layout systems across the same section.

## Composition

- Keep page components focused on composition and data wiring.
- Move reusable UI blocks into namespaced components instead of repeating markup across pages.
