---
description: Vue Router file structure rules for src/router. Use when adding route records, lazy-loaded pages, or router configuration.
paths:
  - 'src/router/**/*.ts'
applyTo: 'src/router/**/*.ts'
---

# Router Rules

## Route Records

- Keep route records minimal and declarative.
- Prefer lazy-loaded page components with `() => import(...)` for routes.
- Route components should point to leaf page components inside `src/pages/...` namespaces.

Example:

```ts
{
	path: '/auth',
	name: 'guest-auth',
	component: () => import('@/pages/guest/auth/AuthView.vue'),
}
```

## Naming and Access

- Pages live at `src/pages/<access>/<name>/<Name>View.vue`, where access is `guest`, `authenticated` or `admin`.
- Route names are `<access>-<name>`. Set `meta.requiresAuth`, `meta.requiresAdmin` or `meta.guestOnly` to match the access folder.
- A new admin route also needs an entry in `adminLinks` in `TopNavigation.vue`, unless it is a full-screen flow with `meta.hideNavigation` (such as `admin-setup`) that a page links to instead, or a sub-page of a listed one.
- A sub-page (such as `admin-show-edit` under `admin-shows`) sets `meta.activeNavRouteName` to its parent's route name, so the navigation keeps the parent highlighted.
- Admins are sent to `admin-setup` by the `beforeEach` guard until the backend reports setup as completed or they skip it for the session. Keep new guard checks above that redirect.

## Structure

- Keep routing concerns in the router namespace. Do not move page-specific rendering logic into router files.
- Add route metadata only when it is consumed by navigation, guards, or page-level behavior.
- Use stable, explicit route paths instead of building paths dynamically inside the route table.
