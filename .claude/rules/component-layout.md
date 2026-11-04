---
description: Vuetify layout structure rules for Vue components and pages. Use when editing .vue files that render layout with Vuetify.
paths:
  - 'src/components/**/*.vue'
  - 'src/pages/**/*.vue'
applyTo: 'src/components/**/*.vue,src/pages/**/*.vue'
---

# Vuetify Layout Rules

## Layout Primitives

- Prefer `v-row` and `v-col` for page and section layout instead of building the entire structure with utility flex or grid classes.
- Start from `cols="12"` and add responsive breakpoints where the layout changes.
- Use Vuetify display utilities for small alignment needs, not as a substitute for the main layout structure.

## Acceptable Exceptions

- Native CSS grid or flex is acceptable when the component is rendering a specialized layout primitive, such as a card rail, overlay, or measured grid that Vuetify grid components do not model cleanly.
- When using a native grid or flex container, keep the exception local and obvious in the component instead of mixing multiple layout systems across the same section.

## Glass Surfaces

Only make a surface see-through when there is something behind it worth seeing. On the calm page background, glass just darkens the surface.

- Solid (the default): dialogs, whose dark backdrop hides the glass and only darkens them, and in-page cards and tables on `<page-background />`, such as statistics, form cards and show or website grids.
- `glass-panel`: over an image or video where the background is meant to be seen (login, setup, the Home banner, image previews), and small floating controls.
- `glass-panel high`: overlays above busy content, so text stays readable. The drawers and every `v-menu` already have it.
- Fade media into a glass surface with `mask-image`, not a gradient of surface color, which leaves a hard line.

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
