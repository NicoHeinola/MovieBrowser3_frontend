---
description: Vuetify plugin and theme file rules for src/plugins/vuetify. Use when editing theme tokens, Vuetify setup, or shared UI configuration.
applyTo: 'src/plugins/vuetify/**/*.ts'
---

# Vuetify Theme Rules

## Theme Ownership

- Keep shared palette, semantic color tokens, and theme-level UI decisions in the Vuetify plugin namespace.
- Prefer updating the theme definition over scattering raw hex values into multiple components.

## Naming

- Use semantic token names that describe intent, such as `primary`, `surface`, or `link`.
- Add comments only when the token intent would otherwise be ambiguous.

## Scope

- Reserve this namespace for application-wide Vuetify setup and shared theme configuration.
- Component-specific styling belongs in the component namespace unless it is becoming a shared design token.
