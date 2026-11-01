---
description: TanStack Query usage rules for query keys, useAPIQuery calls, list query params and cache updates. Use when reading server data, adding a query key, or invalidating or patching cached queries.
paths:
  - 'src/components/**/*.vue'
  - 'src/components/**/*.ts'
  - 'src/pages/**/*.vue'
  - 'src/composables/**/*.ts'
  - 'src/enums/query/**/*.ts'
  - 'src/utils/query/**/*.ts'
applyTo: 'src/components/**/*.vue,src/components/**/*.ts,src/pages/**/*.vue,src/composables/**/*.ts,src/enums/query/**/*.ts,src/utils/query/**/*.ts'
---

# Query Rules

## Query Keys

- Query keys are string enums in `src/enums/query/<domain>QueryKey.ts`. Give each call site its own member, even when two call sites fetch the same endpoint.

```ts
export enum CategoryQueryKey {
  AdminCategories = 'adminCategories',
  CategoryAutocomplete = 'categoryAutocomplete',
  ShowFilterCategories = 'showFilterCategories',
}
```

## Reading Data

- Use `useAPIQuery` from `src/composables/api/` as the shared `useQuery` wrapper. It adds centralized error handling through the snackbar provider.
- Call `useAPIQuery` directly in pages and components with inline query options. Do not create per-domain query composables unless the same query configuration is reused across multiple call sites.
- Return the full query result object rather than cherry-picking; let callers destructure what they need.
- List calls take `ApiQueryParams`: `sort: '-name'`, `filter`, `page: { number, size }`. `page: { number: 0, size: 0 }` fetches everything. Paginated endpoints return `PaginatedResponse<T>`.
- Keep the previous page on screen while a new one loads with `placeholderData: (previousData) => previousData`.

## Updating the Cache

- `getQueryKeyFilter(ShowQueryKey, …)` matches every query keyed by a member of one or more key enums. Pass it to `invalidateQueries`, `setQueriesData` or `getQueryCache().findAll` instead of looping over `Object.values(...)`.
- `updateCachedObjects(data, update)` rewrites matching objects in any cache shape and keeps untouched references. Match on shape as well as id (`entries` for shows, `url` for websites), because nested objects such as tags share ids.

```ts
await queryClient.invalidateQueries(getQueryKeyFilter(WebsiteQueryKey, WebsiteTagQueryKey));
```

- Changes to one show (watch progress, watch status) patch every `getQueryKeyFilter(ShowQueryKey)` query in place instead of refetching.
- The show drawer takes only `v-model:show-id` and reads its show from the `SelectedShow` query, which starts from the copy in a cached list. Don't hand it a cloned show.
