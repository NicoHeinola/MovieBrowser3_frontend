---
name: resource-slice
description: Add or extend a backend resource end-to-end in MovieBrowser3 — API contracts, service, service test, query key, admin page or edit dialog, route and nav link. Use when the user asks to add CRUD/admin management for a new backend entity, wire a new endpoint family into the UI, or "add X like categories".
---

# Resource Slice

Reference slice: **categories**. Before writing anything, read the files it touches so the output matches them:
`interfaces/api/models/Category.ts`, `interfaces/api/requests/{Create,Update}CategoryRequest.ts`, `services/show/categoryService.ts`, `enums/query/categoryQueryKey.ts`, `components/features/category-edit-dialog/*`, `pages/admin/categories/CategoriesView.vue`.

## 1. Decide Ownership

- Pick the service domain folder. Reuse an existing one when the endpoints belong to the same backend area (categories live under `services/show/`).
- If the resource has its own endpoint family, give it a **new sibling service**. Don't grow the parent service.
- Ask the user for the backend field names when they're unknown. Don't guess snake_case shapes.

## 2. Contracts

- `models/<Name>.ts`, `requests/Create<Name>Request.ts` and `requests/Update<Name>Request.ts`. Keep one export per file and the backend's field names as-is.
- Paginated lists reuse `PaginatedResponse<T>`. Plain arrays get no response file.

## 3. Service + Test

- Use the `list/get/create/update/remove` object-export shape.
- Add `services/<domain>/__tests__/<name>Service.test.ts` that mocks `apiClient` and asserts the URLs and payloads.
- Uploads go through `toFormData` with a multipart header, and the test asserts `FormData`.

## 4. Query Key

- Add a string enum `enums/query/<name>QueryKey.ts`, or extend the existing one for the domain. Each call site gets its own member.

## 5. UI

- **Edit dialog**: `components/features/<name>-edit-dialog/` with `<Name>EditDialog.vue`, `<name>EditDialogRules.ts` (`getRules()`) and `index.ts`.
  - Follow the category dialog: `DialogComponentProps<boolean>`, `base-dialog` slots, `base-form`, `isSaving`, change detection and confirm-on-delete.
- **Page**: `pages/admin/<names>/<Names>View.vue`. Read the data with `useAPIQuery` and `placeholderData: (prev) => prev`, and use a `v-skeleton-loader` while it fetches.
  - Open the dialog with `dialog.showDialog({ component, props: { entity: deepClone(x) } })` and refetch when it returns `true`.
- If many rows need scanning, use a `*Table.vue` wrapper instead (see the `vuetify-data-table` instruction).

## 6. Route + Nav

- Add a lazy route `admin-<names>` with `meta: { requiresAuth: true, requiresAdmin: true }` in `src/router/index.ts`.
- Add an entry to `adminLinks` in `components/layouts/top-navigation/TopNavigation.vue` with an `mdi-*` icon.

## 7. Validate

- `npm run fix`, then `npm run check`.
- If the slice changed ownership or conventions, update the matching `.github/instructions/*` file in the same change.
- Suggest a commit such as `feat(<name>): add <name> management with CRUD operations`.
