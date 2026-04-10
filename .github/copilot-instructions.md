# MovieBrowser3 Frontend Copilot Instructions

## Workspace Defaults

- This repository is a Vue 3 + Vite + Vuetify frontend written in TypeScript.
- Use `npm` for project commands and validation.
- Keep source changes inside `src/` namespaced folders instead of dropping new files into broad top-level buckets.
- Keep backend and platform-facing service wrappers in `src/services/<domain>/` namespaces instead of colocating them under stores, components, or pages.
- Preserve the current stack choices: Vue Router for routing, Pinia for client state, Vue I18n for text, Vuetify for UI, Vitest for tests.

## Working Rules

- Prefer extending an existing feature, page, component, utility, or plugin namespace before creating a new top-level namespace.
- Keep backend-facing API shapes in `src/interfaces/api` and preserve backend field names exactly unless a dedicated mapping layer is introduced.
- Keep API-calling service modules in `src/services` and have stores or pages consume them rather than defining service wrappers inside those namespaces.
- Keep design tokens and theme-level color decisions in `src/plugins/vuetify` or shared styles, not scattered through component logic.
- Short explanatory comments are acceptable for interaction-heavy or non-obvious logic, but keep them sparse and focused on why the code exists.
- Prefer existing Vuetify utility classes, props, and built-in transitions before adding component-specific SCSS. For small one-off visual adjustments in Vue components, prefer inline styles over new scoped style blocks.
- Do not add component tests by default. Utility tests under `src/utils/` remain expected, and component tests should be added only when the user explicitly asks for them or when the task is specifically test-focused.
- Run the smallest relevant validation after changes, usually `npm run lint`, `npm test`, or a targeted type check.
- When a requested change affects repository conventions, structure, ownership boundaries, or workflow guidance, update the relevant customization files in the same change without waiting for a separate prompt.

## Component Namespace Barrels

- Public component namespaces under `src/components/common`, `src/components/features`, and `src/components/layouts` should expose their primary component through `index.ts`.
- When creating or refactoring one of those component namespaces, update the matching `index.ts` barrel in the same change instead of leaving direct `.vue` imports behind.
- External consumers should import from the namespace folder, not from a direct component `.vue` path.
- Private sibling imports inside one component namespace can stay direct when they are not part of that namespace's public surface.

## Custom Agent Usage

- Prefer the custom agents when the task naturally fits planning, research, or review instead of doing all of that context work in the default agent.
- Use `feature-planner` when a feature spans multiple files or ownership decisions are still unclear.
- Use `feature-researcher` when you need read-only investigation of repository structure, constraints, contracts, or ownership before deciding what to change.
- Use `feature-reviewer` for code-review style checks focused on regressions, missing tests, and risky contracts.
- Use the default agent for implementation work after planning or research is complete.

## Customization Guidance

- `.github/copilot-instructions.md` is the canonical workspace-wide guidance file for this repository.
- Keep instructions, skills, and agents concise. Do not add large cross-file reference lists when the customization system can load the relevant guidance automatically.
- Treat customization maintenance as part of the implementation whenever repository conventions or structure change; update the affected instruction, skill, or agent files before finishing the task.
