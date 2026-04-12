---
description: Plugin namespace rules for application setup files under src/plugins. Use when editing app registration, configured plugin instances, API client setup, or plugin support modules.
applyTo: 'src/plugins/**/*.ts'
---

# Plugin Namespace Rules

## Ownership

- Keep application-wide framework setup and integration wiring inside `src/plugins`.
- Use subnamespaces for distinct integration areas such as API setup or Vuetify setup.
- Keep `src/plugins/index.ts` as the small entry point that registers the plugin stack with the app.

## File Shape

- Name each plugin file after the configured instance, setup function, or option type it owns.
- Keep top-level registration files focused on wiring plugins together in a clear order.
- Keep plugin-local types and support constants beside the plugin file that owns them.

## Boundaries

- Do not move page markup, component rendering, or feature-specific state into plugin files.
- Keep plugin files focused on application setup, configured instances, and integration boundaries.

## TanStack Query

- Expose the shared `QueryClient` from `src/plugins/query/index.ts` and register it via `VueQueryPlugin` in `registerPlugins`.
- Configure `defaultOptions` (e.g. `staleTime`, `retry`) centrally in the plugin file, not per call-site.
- Import `queryClient` in the plugin entry when explicit cache access is needed outside a component tree.

Example:

```ts
export const registerPlugins = (app: App) => {
  app.use(vuetify);
  app.use(pinia);
  app.use(VueQueryPlugin, { queryClient });
  app.use(router);
};
```
