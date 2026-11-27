---
paths:
  - 'src/plugins/**/*.ts'
---

# Plugin Namespace Rules

- `src/plugins` holds app-wide setup only, one subfolder per integration (`api`, `vuetify`, `query`, `i18n`). No page markup, rendering or feature state.
- `src/plugins/index.ts` (`registerPlugins`) is the app's startup wiring: it creates Pinia, registers the plugins in order, sets up the API client's auth (logout and a redirect to `guest-auth` on a 401), and loads the settings whenever a token appears. Only this file may import stores and the router.
- A heavy library that only one lazy route uses is registered by the component that needs it, not in `registerPlugins`, so it stays out of the main bundle. ECharts is one: the chart component calls `registerECharts()`.

## TanStack Query

- The shared `QueryClient` lives in `src/plugins/query/index.ts` and is registered with `VueQueryPlugin` in `registerPlugins`.
- `defaultOptions` (`staleTime`, `retry`) are set there, not per call site.
- Code outside a component tree that needs the cache imports `queryClient` from there.

```ts
export const registerPlugins = (app: App) => {
  const pinia = createPinia();

  app.use(vuetify);
  app.use(pinia);
  app.use(i18n);
  app.use(VueQueryPlugin, { queryClient });
  // ... API client auth and the settings watcher ...
  app.use(router);
};
```
