# MovieBrowser3 Frontend

Guidance for AI coding agents (Claude Code and Copilot). File-specific rules live in `.claude/rules/` and load automatically for matching files.

## Workspace Defaults

- This repository is a Vue 3 + Vite + Vuetify frontend written in TypeScript.
- Use `npm` for project commands and validation.
- Keep source changes inside `src/` namespaced folders instead of dropping new files into broad top-level buckets.
- Keep backend and platform-facing service wrappers in `src/services/<domain>/` namespaces instead of colocating them under stores, components, or pages.
- Preserve the current stack choices: Vue Router for routing, Pinia for client state, TanStack Vue Query for server-state caching, Vuetify for UI, Vitest for tests.

## Commands

- `npm run check:types`: `vue-tsc --build --force`
- `npm run check:lint` / `npm run fix:lint`: ESLint (`eslint-config-vuetify`, enforces import order and Vue attribute order)
- `npm run check:format` / `npm run fix:format`: Prettier (single quotes, semicolons, 120 cols)
- `npm test`: Vitest once; `npx vitest run <path>` for a single file
- `npm run fix` then `npm run check`: full pass before finishing a multi-file change

## Working Rules

- Prefer extending an existing feature, page, component, utility, or plugin namespace before creating a new top-level namespace.
- Document declarations with JSDoc (`/** ... */`) that describes their purpose, with `@param` and `@returns` tags on functions. Write comments inside logic as `//`, and add short step comments to non-obvious logic.
- Keep backend-facing API shapes in `src/interfaces/api` and preserve backend field names exactly unless a dedicated mapping layer is introduced.
- When adapting a backend contract into a small consumer shape such as a keyed lookup `Record`, keep that mapped type local to the service or consumer unless it is reused broadly; do not create one-line support files for simple aliases.
- Keep API-calling service modules in `src/services` and have stores or pages consume them rather than defining service wrappers inside those namespaces.
- Keep service fetch methods returning backend payloads as-is. Put UI-facing normalization, keyed lookup maps, and other consumer-specific reshaping in stores, composables, or pages.
- Keep each backend resource or independently versioned endpoint family in its own service concept. For sub-resources with dedicated CRUD endpoints, add a sibling service file instead of growing the parent service into a catch-all module.
- Keep design tokens and theme-level color decisions in `src/plugins/vuetify` or shared styles, not scattered through component logic.
- Use the dialog provider system for application dialogs. Open dialogs with `useDialog().showDialog(...)` and keep dialog components compatible with `src/components/layouts/dialog-provider`; do not mount feature dialogs inline in pages or other templates.
- Run the smallest relevant validation after changes, usually `npm run check:lint`, `npm test`, or `npm run check:types`.

## Changelog and Releases

Releases are `vX.Y.Z` git tags with a GitHub release; production installs build the newest tag, never `main`. The app version lives in `package.json`, and `src/data/changelog/changelogEntries.ts` lists every version, newest first. Tests keep the newest entry's version equal to `package.json` and every version one step above the one below it.

- Between releases, the top entry is the next version with `date: null`. The app hides it until it is released.
- Every user-facing change (new feature, visible change, bug fix, removal) adds a line to that entry in the same change. Skip refactors, tests, docs and tooling. The backend has no changelog, so its user-visible changes get a line here too.
- Write each line for users, in plain words: "Show cards show the primary title in a tooltip.", not "feat(show-card): add tooltip".
- Size the version from the last release, never from the current unreleased number: fixes and small changes keep the patch step, a new feature raises it to the next minor (`1.0.1` becomes `1.1.0`), a breaking or removed feature to the next major (`2.0.0`). Never step twice: after `1.0.0`, the next release is `1.0.1`, `1.1.0` or `2.0.0`. Set the same version in `package.json`.
- Releasing follows the `release` skill: it dates the entry, tags it, creates the GitHub release and then starts the next patch entry.

## Production

Production runs on the user's own machine, not a server or registry. The backend repo's install script builds this repo with `npm run build`, and the backend's web server serves `dist/` next to the API on the same address, so production builds call the relative `/api/v1` from `.env.production`.

- A new `VITE_*` variable needs a production value in `.env.production`, or the production build fails on it.
- Keep `npm run build` working without a `.env` file: production builds have only `.env.production`.

## Commit Messages

Use Conventional Commits: `type(scope): short summary`.

- Lowercase `type` and `scope`. Keep the summary short, imperative and specific, with no trailing period.
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`, `build`, `ci`.
- Work for a GitHub issue uses the issue number as its scope: `feat(#20): make show drawer sections collapsible`.
- Other changes add an area scope when they clearly belong to one area, such as `auth`, `home`, `top-navigation`, `shows`, `router`, `vuetify` or `api`.
- Mark a breaking change with `!` after the type or scope (`feat(api)!: rename show status filter values`) and describe the break in the body.
- Add a body when the reason for the change is not obvious from the summary.

```text
fix(auth): handle expired refresh token

Avoids leaving the UI in a logged-in state after the backend rejects
the refresh request during app startup.
```

## Customization

`.claude/` is the single source of truth. Copilot reads it too; `.github/copilot-instructions.md` and `.github/skills` are symlinks into it.

- **Rules** (`.claude/rules/*.md`): "files matching X should look like Y". Each rule has a `paths` list and the same globs in `applyTo` for Copilot.
- **Skills** (`.claude/skills/<name>/SKILL.md`): reusable workflows such as building a resource or feature slice, writing tests or reviewing a diff.
- When a change affects repository conventions, structure, ownership boundaries or workflow guidance, update the affected rules or skills in the same change. A backend endpoint family that moves, splits or gains a new service concept counts.
- Keep customizations concise. Do not add cross-file reference lists when the rules already load for matching files.

## Response Style

- Prefer terse, high-signal responses by default. Drop filler, hedging, and repeated framing.
- Lead with the technical conclusion or next action. Keep explanations compact unless the user explicitly asks for depth.
- Use short sentences or fragments when they preserve clarity. Keep technical accuracy, validation details, and risk callouts intact.
- For implementation updates, state what changed, what was validated, and any remaining blocker. Do not pad with reassurance or narration.
- Preserve repository-specific requirements that need explicit wording, including file links, validation results, assumptions, and next steps.
- If the user asks for normal or detailed mode, follow that request for the rest of the conversation or until they change it.
