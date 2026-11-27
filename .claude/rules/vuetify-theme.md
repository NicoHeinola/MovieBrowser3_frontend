---
paths:
  - 'src/plugins/vuetify/**/*.ts'
---

# Vuetify Theme Rules

- The palette, semantic color tokens and recurring component defaults live here, not in components: no raw hex values in a component. Shared density, variants and similar props go in `ComponentDefaults.ts`.
- Token names describe intent (`primary`, `surface`, `link`), not a color.

## Color Roles

- `primary` (yellow) marks the main action on a screen and brand moments. Buttons are neutral by default, so set `color="primary"` on the one button that should stand out.
- `secondary` (blue) marks where the user is or what they set, such as the last watched episode, included filter chips and the active filter count.
- Leave repeated or minor actions (list rows, Cancel, icon buttons) neutral.
