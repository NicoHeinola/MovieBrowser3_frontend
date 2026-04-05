---
name: vuetify-theme-workflow
description: Evolve the application's Vuetify theme and shared visual tokens. Use when adjusting colors, theme semantics, shared UI styling direction, or deciding whether a visual change belongs in the theme or in a component.
---

# Vuetify Theme Workflow

Use this skill when visual changes may affect more than one component or when raw styling is drifting into component code.

## Workflow

1. Identify whether the requested change is component-local or application-wide.
2. If the change is shared or semantic, prefer the Vuetify theme namespace in `src/plugins/vuetify`.
3. Keep theme token names intent-based instead of feature-specific where possible.
4. Update component code to consume the shared token rather than duplicating raw values.
5. Verify that the theme remains coherent across pages and components.

## Good Fits For Theme Ownership

- Brand and accent colors.
- Surface and background roles.
- Shared link or emphasis styling.
- Visual tokens reused across multiple features.

## Keep Local To Components When

- The styling is truly one-off.
- The change is layout-specific rather than theme-specific.
- Promoting the value to a shared token would create noise without reuse.
