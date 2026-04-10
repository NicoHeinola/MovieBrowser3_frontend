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
- Run the smallest relevant validation after changes, usually `npm run lint`, `npm test`, or a targeted type check.
- When a requested change affects repository conventions, structure, ownership boundaries, or workflow guidance, update the relevant customization files in the same change without waiting for a separate prompt.

## Customization Roles

- Use instructions for file and folder structure rules. They should describe what matching files should look like, where they should live, and what they may expose.
- Use skills for reusable workflows or verbs such as building a feature slice, auditing structure, wiring store and API layers, or writing tests.
- Use custom agents for large planning, research, or review tasks that benefit from an isolated context window and a concise returned result.
- If guidance can be expressed as "files matching X should look like Y", keep it in an instruction instead of a skill or agent.

## Component Namespace Barrels

- Public component namespaces under `src/components/common`, `src/components/features`, and `src/components/layouts` should expose their primary component through `index.ts`.
- When creating or refactoring one of those component namespaces, update the matching `index.ts` barrel in the same change instead of leaving direct `.vue` imports behind.
- External consumers should import from the namespace folder, not from a direct component `.vue` path.
- Private sibling imports inside one component namespace can stay direct when they are not part of that namespace's public surface.

## Custom Agent Usage

- Prefer the custom agents only when the task benefits from delegation into a smaller context window.
- Use `feature-planner` for isolated planning before implementation when a feature spans multiple files or ownership decisions are still unclear.
- Use `feature-researcher` for isolated read-only investigation of repository structure, constraints, contracts, or ownership.
- Use `feature-reviewer` for an isolated review pass that returns findings first.
- Use the default agent for implementation work and let the relevant skills shape the workflow inside that implementation pass.

## Customization Guidance

- `.github/copilot-instructions.md` is the canonical workspace-wide guidance file for this repository.
- Keep instructions, skills, and agents concise. Do not add large cross-file reference lists when the customization system can load the relevant guidance automatically.
- Treat customization maintenance as part of the implementation whenever repository conventions or structure change; update the affected instruction, skill, or agent files before finishing the task.
