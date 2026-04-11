---
description: Vuetify layout structure rules for Vue components and pages. Use when editing .vue files that render layout with Vuetify.
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

## Loading Layout

- When a layout section is waiting on async data, keep the intended Vuetify layout structure in place and render loading with built-in `loading` props or `v-skeleton-loader`.
- Do not add custom loading wrappers, custom overlay sections, or bespoke spinner rows for routine loading states.

Example:

```vue
<v-row>
  <v-col cols="12" md="8">
    <show-banner />
  </v-col>
  <v-col cols="12" md="4">
    <selected-show-drawer />
  </v-col>
</v-row>
```
