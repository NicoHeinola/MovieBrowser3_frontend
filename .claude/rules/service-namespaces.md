---
paths:
  - 'src/services/**/*.ts'
---

# Service Namespace Rules

## File Shape

- One service per file, named after its concept (`authService.ts`), in `src/services/<domain>/`. Reuse the domain folder when the endpoints belong to the same backend area.
- Declare `const list/get/create/update/remove` arrow functions, then export them as one object: `export const xService = { list, get, create, update, remove }`. Use `remove`, not `delete`. Other methods are named for the domain (`login`, not `authPost`).
- Use relative paths without a leading slash (`'categories'`, `` `episodes/${id}` ``) and return `response.data`.
- List methods take `ApiQueryParams` and pass it as `params`. Paginated endpoints return `PaginatedResponse<T>`.
- File uploads go through `toFormData(request)` with a `multipart/form-data` header.
- A backend sub-resource with its own endpoint family gets a sibling service file. Keep `showService.ts` on `/shows`, and put `/shows/:showId/titles` plus `/titles/:titleId` in `showTitleService.ts`.

```typescript
// src/services/setting/settingService.ts
import type { SettingValues } from '@/interfaces/api/models/SettingValues';
import type { UpdateSettingRequest } from '@/interfaces/api/requests/UpdateSettingRequest';
import type { SettingsResponse } from '@/interfaces/api/responses/SettingsResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (): Promise<SettingsResponse> => {
  const response = await apiClient.get<SettingsResponse>('settings');

  return response.data;
};

const update = async <K extends keyof SettingValues>(
  key: K,
  request: UpdateSettingRequest<SettingValues[K]>,
): Promise<void> => {
  await apiClient.patch(`settings/${key}`, request);
};

export const settingService = {
  list,
  update,
};
```

## Boundaries

- Return backend payloads as received. No keyed maps, flattened wrappers or reshaping for one consumer: stores, composables or pages do that. Contracts come from `src/interfaces/api`.
- A small mapped shape for one consumer, such as a keyed lookup `Record`, stays a local type there. No one-line support file for a simple alias.
- Server-Sent Event streams cannot use the axios `apiClient`. Open them with `fetchEventSource` from `@microsoft/fetch-event-source`, take the bearer token and an `AbortSignal` from the caller, set `openWhenHidden: true` so the caller owns tab-visibility handling, and pass parsed events to callbacks (see `watchProgressStreamService.ts`).
