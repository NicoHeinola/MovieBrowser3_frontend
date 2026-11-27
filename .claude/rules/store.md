---
paths:
  - 'src/stores/**/*.ts'
---

# Store Rules

Copy the shape of `src/stores/setting/useSettingStore.ts`.

- One `useXStore` per file, as a setup store (`defineStore('x', () => { … })`).
- Async fetching, persistence and mutations go in store actions. They track `isLoading` for every consumer.
- Actions don't catch errors or keep error state: the caller (a component or page) shows them.

## TanStack Query vs Pinia

- Use `useAPIQuery` in pages and components for read-only server state that benefits from caching, refetching and the shared error handling.
- Keep Pinia stores for client-side state, mutations with side effects, or state that many components share from app startup.
- Store actions may use `queryClient.query` (with `staleTime: 'static'` to reuse cached data) or `queryClient.resetQueries` to share TanStack Query's cache. The Pinia `ref` stays the one owner of that data.
- Never have both a `useAPIQuery` call and a Pinia `ref` for the same data in the same consumer.
