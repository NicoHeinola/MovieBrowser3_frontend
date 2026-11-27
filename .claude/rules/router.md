---
paths:
  - 'src/router/**/*.ts'
---

# Router Rules

- Route records stay declarative, with fixed paths. Each one lazy-loads a leaf page: `component: () => import('@/pages/guest/auth/AuthView.vue')`.
- Pages live at `src/pages/<access>/<name>/<Name>View.vue`, where access is `guest`, `authenticated` or `admin`.
- Route names are `<access>-<name>`. Set `meta.requiresAuth`, `meta.requiresAdmin` or `meta.guestOnly` to match the access folder. Add other `meta` only when navigation, a guard or a page reads it.
- A new admin route also needs an entry in `adminLinks` in `TopNavigation.vue`, unless it is a full-screen flow with `meta.hideNavigation` (such as `admin-setup`) that a page links to instead, or a sub-page of a listed one.
- A sub-page (such as `admin-show-edit` under `admin-shows`) sets `meta.activeNavRouteName` to its parent's route name, so the navigation keeps the parent highlighted.
- Admins are sent to `admin-setup` by the `beforeEach` guard until the backend reports setup as completed or they skip it for the session. Keep new guard checks above that redirect.
