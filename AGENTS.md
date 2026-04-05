# MovieBrowser3 Frontend Agent Guide

## Workspace Defaults

- This repository is a Vue 3 + Vite + Vuetify frontend written in TypeScript.
- Use `npm` for project commands and validation.
- Keep source changes inside `src/` namespaced folders instead of dropping new files into broad top-level buckets.
- Preserve the current stack choices: Vue Router for routing, Pinia for client state, Vue I18n for text, Vuetify for UI, Vitest for tests.

## Working Rules

- Prefer extending an existing feature, page, component, utility, or plugin namespace before creating a new top-level namespace.
- Keep backend-facing API shapes in `src/interfaces/api` and preserve backend field names exactly unless a dedicated mapping layer is introduced.
- Keep design tokens and theme-level color decisions in `src/plugins/vuetify` or shared styles, not scattered through component logic.
- Run the smallest relevant validation after changes, usually `npm run lint`, `npm test`, or a targeted type check.

## Customization Model

- `AGENTS.md` is the single always-on workspace instruction file for this repository.
- Files in `.github/instructions/` are for file-specific rules only.
- Files in `.github/skills/` are for reusable workflows and domain procedures.
- Files in `.github/agents/` define specialized roles for planning, implementation, review, and structure audits.
