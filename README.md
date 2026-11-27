# MovieBrowser3 Frontend

The web app of MovieBrowser3, a show and movie library that runs on your own PC. It covers browsing and search, watch status and progress, playback in VLC, torrent downloads and an admin area. It is built with Vue 3, Vuetify and TypeScript. The API lives in the `MovieBrowser3_backend` repo.

## Requirements

- Node.js 24 or newer, and npm.
- A running backend (see its README).

## Setup

```bash
npm install
cp .env.example .env
```

In `.env`, `VITE_API_URL` points at the backend's API (`http://localhost:8765/api/v1` in dev) and `APP_PORT` sets the port the app runs on.

## Commands

```bash
npm run dev            # start the development server
npm run build          # type-check and build for production
npm run preview        # preview the production build
npm run check          # types, lint, format and tests
npm run fix            # fix lint and formatting issues
npm test               # run tests once
npm run test:watch     # run tests in watch mode
npm run test:coverage  # run tests with coverage
```

## Production

Production runs on your own machine. The backend repo's install script clones this repo, builds it with `npm run build` in a throwaway Node container, and the backend's web server serves the result next to the API on the same address. You don't build or serve it by hand.

- **API URL**: production builds use `.env.production`, which points the app at `/api/v1` on its own address.
- **Install, update, ports**: see the backend repo's `deploy/README.md`.

## Project Structure

| Folder            | Holds                                                     |
| ----------------- | --------------------------------------------------------- |
| `src/pages`       | route pages, by access: `guest`, `authenticated`, `admin` |
| `src/components`  | reusable UI (`common`), features and layouts              |
| `src/composables` | reusable stateful logic (`useX`)                          |
| `src/stores`      | Pinia stores for shared client state                      |
| `src/services`    | API calls, one service per backend resource               |
| `src/interfaces`  | TypeScript shapes; `api` holds the backend contracts      |
| `src/enums`       | enums, including query keys                               |
| `src/data`        | content that ships with the app, such as the changelog    |
| `src/plugins`     | app setup: Vuetify theme, API client, query client, i18n  |
| `src/router`      | routes and guards                                         |
| `src/rules`       | form validation rules                                     |
| `src/utils`       | small tested helpers                                      |

## AI Agent Guidance

Claude Code reads `CLAUDE.md`, the file-specific rules in `.claude/rules/` and the workflows in `.claude/skills/`.
