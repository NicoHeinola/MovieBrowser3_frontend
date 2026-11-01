---
description: Vuetify plugin and theme file rules for src/plugins/vuetify. Use when editing theme tokens, theme defaults, Vuetify setup, or shared UI configuration.
paths:
  - 'src/plugins/vuetify/**/*.ts'
applyTo: 'src/plugins/vuetify/**/*.ts'
---

# Vuetify Theme Rules

## Theme Ownership

- Keep shared palette, semantic color tokens, and theme-level UI decisions in the Vuetify plugin namespace.
- Prefer updating the theme definition over scattering raw hex values into multiple components.

## Naming

- Use semantic token names that describe intent, such as `primary`, `surface`, or `link`.
- Add comments only when the token intent would otherwise be ambiguous.

## Color Roles

- `primary` (yellow) marks the main action on a screen and brand moments. Buttons are neutral by default, so set `color="primary"` on the one button that should stand out.
- `secondary` (blue) marks where the user is or what they set, such as the last watched episode, included filter chips and the active filter count.
- Leave repeated or minor actions (list rows, Cancel, icon buttons) neutral.

## Scope

- Reserve this namespace for application-wide Vuetify setup and shared theme configuration.
- Component-specific styling belongs in the component namespace unless it is becoming a shared design token.
- Keep shared component density, variants, and recurring visual defaults in `ComponentDefaults.ts` instead of repeating local Vuetify props across feature components.
