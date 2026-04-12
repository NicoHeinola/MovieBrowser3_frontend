---
description: Pinia store file rules for src/stores. Use when creating or editing client state modules, store helpers, or store-local selectors.
applyTo: 'src/stores/**/*.ts'
---

# Store Rules

## Store Shape

- Keep one store per file or namespace entry point.
- Name stores with the `useXStore` convention.
- Always use `const` arrow functions for actions and helpers instead of `function` declarations.
- Type state, action inputs, and derived values explicitly (prefer `ref<T>(...)` and `computed<T>(() => ...)` syntax).

### Example: Proper Store Structure

```typescript
export const useSettingStore = defineStore('setting', () => {
  const settings = ref<Setting[]>([]);
  const isLoading = ref<boolean>(false);

  // Computed with explicit typing using generic syntax
  const bannerDefaultVideos = computed<string[]>(() => {
    return (settings.value.find((s) => s.key === 'banner_default_videos')?.value as string[]) || [];
  });

  // Action using const arrow function
  const fetchSettings = async () => {
    isLoading.value = true;
    try {
      settings.value = await settingService.getSettings();
    } finally {
      isLoading.value = false;
    }
  };

  return {
    settings,
    isLoading,
    bannerDefaultVideos,
    fetchSettings,
  };
});
```

## Responsibilities

- Put async fetching, persistence, and mutation logic in store actions.
- Do not store error state or catch errors inside store actions; error handling belongs to the caller (e.g., component or page).
- Track loading state (`isLoading`) inside the store to provide UI feedback across consumers.
- Have consumers render store loading state with Vuetify built-in `loading` props or `v-skeleton-loader` only.
- Keep components focused on presentation and event wiring rather than duplicating store logic.
- Do not hide backend contracts inside stores; import shared contracts from `src/interfaces/api`.
- Import API-calling service wrappers from `src/services/<domain>/` instead of colocating them inside `src/stores` namespaces.

## TanStack Query vs Pinia

- Use `useAPIQuery` in pages and components for read-only server state that benefits from automatic caching, refetching, and centralized error handling.
- Keep Pinia stores for client-side state, mutations with side effects, or state that needs to be shared across many components at app startup.
- Store actions may use `queryClient.ensureQueryData` or `queryClient.resetQueries` to leverage TanStack Query's cache for deduplication without introducing a parallel reactive owner; the Pinia `ref` remains the single source of truth in that case.
- Do not create both a `useAPIQuery` call and a Pinia `ref` for the same data in the same consumer; own it in one place per usage context.

## Growth Path

- When a store gains related helper types or selectors, keep them in the same store namespace rather than scattering them across unrelated folders.
