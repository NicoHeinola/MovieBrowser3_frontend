# MovieBrowser3 Frontend

MovieBrowser3 Frontend is a Vue 3 + Vuetify app for browsing shows in a streaming-style interface.

Right now the project is an early frontend scaffold with a public home page, reusable show components, and mock data for development.

## Requirements

- Node.js 22 or newer
- npm

## Quick Start

```bash
npm install
npm run dev
```

The development server starts with Vite.

If you want to choose a custom port, set `APP_PORT` before starting the app.

Example:

```bash
APP_PORT=4173 npm run dev
```

## Available Commands

```bash
npm run dev            # start the development server
npm run build          # type-check and build for production
npm run preview        # preview the production build
npm run check          # types, lint, format and tests
npm run check:types    # run TypeScript checks
npm run check:lint     # run ESLint
npm run check:format   # check formatting with Prettier
npm run fix            # fix lint and formatting issues
npm test               # run tests once
npm run test:watch     # run tests in watch mode
npm run test:coverage  # run tests with coverage
```

## Project Structure

- `src/pages` contains route-level pages
- `src/components` contains reusable UI and feature components
- `src/interfaces/api` contains backend-facing TypeScript interfaces
- `src/plugins` contains app plugin setup such as Vuetify
- `src/router` contains Vue Router setup
- `src/utils` contains small tested helpers

## AI Assistants

Agent guidance lives in `.claude/` and works for both Claude Code and Copilot:

- `AGENTS.md`: repo-wide guidance. `CLAUDE.md` imports it, and `.github/copilot-instructions.md` is a symlink to it.
- `.claude/rules/`: file-specific rules. Claude loads them through `paths`, Copilot through `applyTo`.
- `.claude/skills/`: workflows. `.github/skills` is a symlink to it.
- `.claude/agents/`: planner, researcher and reviewer agents.

In VS Code, Copilot loads `AGENTS.md` by default (`chat.useAgentsMdFile`). If it doesn't pick up the rules, add `.claude/rules` to `chat.instructionsFilesLocations` in your user settings.

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vuetify
- Vue Router
- Pinia
- Vitest

## Current Status

The app currently ships with a home route and mock show content. Search, auth, admin features, and broader data integration are planned but not implemented yet.
