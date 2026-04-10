---
description: Vue Router file structure rules for src/router. Use when adding route records, lazy-loaded pages, or router configuration.
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
	path: '/auth/login',
	name: 'login',
	component: () => import('@/pages/public/auth/login/LoginPage.vue'),
}
```

## Structure

- Keep routing concerns in the router namespace. Do not move page-specific rendering logic into router files.
- Add route metadata only when it is consumed by navigation, guards, or page-level behavior.
- Use stable, explicit route paths instead of building paths dynamically inside the route table.
