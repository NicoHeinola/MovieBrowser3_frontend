---
description: Service namespace rules for TypeScript service files under src/services. Use when adding or refactoring API wrapper services, service-local helpers, backend-facing modules, or platform integrations.
applyTo: 'src/services/**/*.ts'
---

# Service Namespace Rules

## Ownership

- Put backend-facing and platform-facing service wrappers in `src/services/<domain>/` namespaces.
- Keep stores, pages, and components consuming services rather than defining service wrappers inside those namespaces.
- Reuse an existing service domain folder when the new file talks to the same backend or platform area.

## File Shape

- Name each service file after the single service concept it exports, such as `authService.ts`.
- Keep one primary exported service per file.
- Do not add `index.ts` barrels to service namespaces unless a deliberate public boundary is needed by multiple external consumers.
- When a backend sub-resource has its own endpoint family, split it into a sibling service file instead of adding it to the parent resource service. For example, keep `showService.ts` focused on `/shows` endpoints and move `/shows/:showId/titles` plus `/titles/:titleId` into `showTitleService.ts`.

### Example: Service Module

```typescript
// src/services/setting/settingService.ts
import type { Setting } from '@/interfaces/api/models/Setting';
import { apiClient } from '@/plugins/api/apiClient';

export const settingService = {
  // Use explicit return type, avoid unnecessary response wrappers
  getSettings: async (): Promise<Setting[]> => {
    const { data } = await apiClient.get<Setting[]>('/settings');
    return data;
  },
};
```

## Boundaries

- Service files may depend on shared API clients, request and response interfaces, and closely related service-local helpers.
- Do not move backend contract definitions into services; import them from `src/interfaces/api`.
- Keep UI state, persistence decisions, and view-specific formatting in stores or components rather than in service modules.
- Method names should be clear and domain-focused (e.g., `login` instead of `authPost`).
- Avoid catch-all resource services that accumulate unrelated endpoint groups. If two endpoint groups can evolve independently, give them separate service concepts even when they live in the same namespace folder.
