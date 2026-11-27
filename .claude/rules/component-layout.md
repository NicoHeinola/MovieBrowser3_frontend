---
paths:
  - 'src/components/**/*.vue'
  - 'src/pages/**/*.vue'
---

# Vuetify Layout Rules

## Layout

- Lay out pages and sections with `v-row` and `v-col`. Start from `cols="12"` and add breakpoints where the layout changes. Display utilities are for small alignment only.
- Native CSS grid or flex is fine for a layout that Vuetify's grid doesn't model cleanly: a card rail, an overlay, a measured grid. Keep it local to that component, and don't mix layout systems in one section.

## Glass Surfaces

Only make a surface see-through when there is something behind it worth seeing. On the calm page background, glass just darkens the surface.

- Solid (the default): dialogs, whose dark backdrop hides the glass and only darkens them, and in-page cards and tables on `<page-background />`, such as statistics, form cards and show or website grids.
- `glass-panel`: over an image or video where the background is meant to be seen (login, setup, the Home banner, image previews), and small floating controls.
- `glass-panel high`: overlays above busy content, so text stays readable. The drawers and every `v-menu` already have it.
- Fade media into a glass surface with `mask-image`, not a gradient of surface color, which leaves a hard line.

## Loading

- While a section waits on data, keep its layout in place. Use the component's built-in `loading` prop when it has one (tables too), otherwise `v-skeleton-loader`.
- No other loading treatment: no custom spinners, shimmer markup, loading wrappers or overlays, and no progress bar as a loading spinner. A `v-progress-*` that shows real progress (a download, a task, watch progress) is fine.
- `src/styles/main.scss` delays every `v-skeleton-loader` globally, so fast loads show nothing. Don't add per-component delays.
- The one exception is the route-change loader in `App.vue`: it uses `v-progress-linear`, because it belongs to no component with a `loading` prop.

```vue
<v-row>
  <v-col cols="12" md="8">
    <show-banner :loading="isLoading" />
  </v-col>
  <v-col cols="12" md="4">
    <v-skeleton-loader type="card" v-if="isLoading" />
    <latest-shows-panel v-else />
  </v-col>
</v-row>
```
