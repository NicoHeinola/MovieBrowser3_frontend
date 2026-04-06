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
npm run type-check     # run TypeScript checks
npm run lint           # run ESLint
npm run lint:fix       # fix lint issues when possible
npm test               # run tests
npm run test:coverage  # run tests with coverage
npm run format         # format the project with Prettier
```

## Project Structure

- `src/pages` contains route-level pages
- `src/components` contains reusable UI and feature components
- `src/interfaces/api` contains backend-facing TypeScript interfaces
- `src/plugins` contains app plugin setup such as Vuetify
- `src/router` contains Vue Router setup
- `src/utils` contains small tested helpers

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
