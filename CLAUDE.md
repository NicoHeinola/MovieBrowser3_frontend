# MovieBrowser3 Frontend

Guidance for Claude Code. File-specific rules live in `.claude/rules/` and load automatically for matching files.

## Workspace Defaults

- Vue 3 + Vite + Vuetify, in TypeScript. Use `npm` for commands.
- Keep the stack: Vue Router for routing, Pinia for client state, TanStack Vue Query for server-state caching, Vuetify for UI, Vitest for tests.
- The frontend owns all user-facing text: translations live in `src/plugins/i18n/en.json` and `fi.json`. The backend sends message codes plus params, never sentences.
- Utilities under `src/utils` and services always get tests: `src/__tests__/unitTestCoverage.test.ts` fails for a file that declares a function and has no `__tests__/<name>.test.ts`. Component tests are opt-in: when the task asks for them or the behavior is risky.

## Commands

- `npm run check:types`: `vue-tsc --build --force`
- `npm run check:lint` / `npm run fix:lint`: ESLint (`eslint-config-vuetify`, enforces import order and Vue attribute order)
- `npm run check:format` / `npm run fix:format`: Prettier (single quotes, semicolons, 120 cols)
- `npm test`: Vitest once; `npx vitest run <path>` for a single file
- After a small change, run the smallest relevant check: usually `npm run check:lint`, `npm test` or `npm run check:types`.
- `npm run fix` then `npm run check`: full pass before finishing a multi-file change

## Run locally

- `npm run dev` serves on `APP_PORT` from `.env` (3010 in the main checkout) and calls the API at `VITE_API_URL`.
- A separate copy of the app (a ticket or a test) sets its own `APP_PORT` and points `VITE_API_URL` at its own backend (`http://localhost:<backend port>/api/v1`), then runs `npm run dev`.

## Changelog and Releases

Releases are `vX.Y.Z` git tags with a GitHub release; production installs build the newest tag, never `main`. The app version lives in `package.json`, and `src/data/changelog/changelogEntries.ts` lists every version, newest first. Tests keep the newest entry's version equal to `package.json` and every version one step above the one below it.

The frontend's version is the app version, the only one users see (version link, "What's new", update notice). It covers the backend's user-visible changes too. The backend numbers its own releases by API changes, so its version can run ahead (backend `3.0.0` with app `2.2.0`) and is never shown as the app's.

- Between releases, the top entry is the next version with `date: null`. The changelog page lists it as upcoming once it has lines, the "What's new" popup only after it is released. Production builds a tag, whose top entry is dated, so only builds of `main` show it.
- Every user-facing change (new feature, visible change, bug fix, removal) adds a line to that entry in the same change. Skip refactors, tests, docs, tooling and dev-only features (production never builds the unreleased entry, so users can't see them). The backend has no changelog, so its user-visible changes get a line here too.
- Classify by what the user gains: **Added** when there is more than before, **Changed** only for a like-for-like swap, **Fixed** and **Removed** as named. Never log fixes or tweaks to a feature that is new in the same entry. Before calling a line Fixed or Changed, check the feature existed in the last tag (`git show vX.Y.Z:<path>`, `git log vX.Y.Z..HEAD`): commit messages can make a new feature look old. When several lines share a subject, use one line with `details` sub-points instead of repeating the subject.
- Write each line for users, in plain words: "Show cards show the primary title in a tooltip.", not "feat(show-card): add tooltip".
- Size the version from the last release, never from the current unreleased number: fixes and small changes keep the patch step, a new feature raises it to the next minor (`1.0.1` becomes `1.1.0`), a breaking or removed feature to the next major (`2.0.0`). Size from what users notice, not from backend API breaks the frontend absorbs. Never step twice: after `1.0.0`, the next release is `1.0.1`, `1.1.0` or `2.0.0`. Set the same version in `package.json`.
- Releasing follows the global `release` skill, and only on the user's explicit request. Frontend specifics:
  - Version to release: the top changelog entry, with `date: null`, at least one change, and its version equal to `package.json`.
  - Backend first: installs build the newest tag of each repo, so the newest backend release must already serve every API this release calls. Compare backend `origin/main` with its newest `v*` tag.
  - Release commit: set the entry's `date` to today, run `npm run check`, `npm test` and `npm run build`, then commit `chore(release): vX.Y.Z`.
  - Next version: set `package.json` to the next patch, add `{ version: 'X.Y.(Z+1)', date: null, changes: [] }` at the top of the entries and run `npm test`.
  - Release notes: from the released entry, one `### Added` / `### Changed` / `### Fixed` / `### Removed` heading per type that has lines, each line as a bullet and each `details` item as an indented sub-bullet.
  - Report: installs pick the release up on their next `~/prod_codes/MovieBrowser3/moviebrowser3 update`.

## Production

Production runs on the user's own machine, not a server or registry. The backend repo's install script builds this repo with `npm run build`, and the backend's web server serves `dist/` next to the API on the same address, so production builds call the relative `/api/v1` from `.env.production`.

- A new `VITE_*` variable needs a production value in `.env.production`, or the production build fails on it.
- Keep `npm run build` working without a `.env` file: production builds have only `.env.production`.
- Optional `VITE_*` variables, such as `VITE_APP_VERSION_SUFFIX`, are read with a fallback (`getEnvString(key, '')`) and still listed in `.env.production`, empty when production wants none.

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

- **Rules** (`.claude/rules/*.md`): what files matching their `paths` look like. They load when Claude reads a matching file.
- **Skills** (`.claude/skills/<name>/SKILL.md`): this repo's moments, such as "add X like categories" or reviewing a frontend change. Generic moments (tickets, reviews, tests, push, releases) are global skills; their repo specifics live in this file and the rules.
- A change to a convention, structure, ownership boundary or workflow updates the affected rule or skill in the same change. A backend endpoint family that moves, splits or gains a new service concept counts.
