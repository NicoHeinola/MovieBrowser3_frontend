---
paths:
  - 'src/**/__tests__/*.test.ts'
---

# Test File Rules

- A test file sits in a `__tests__` folder next to the code it tests and is named `<implementation>.test.ts`, one per implementation file.
- Start from the closest existing test in the nearest `__tests__` folder (services: `src/services/show/__tests__/showLinkService.test.ts`).
- Keep setup local to the file unless sibling tests reuse the same helper.
- Mock only the edges: `apiClient`, router, Vuetify display state, browser APIs, `import.meta.env`. Stub `import.meta.env` in the test file, never rely on the ambient environment.

## Service Tests

- Mock the API client with `vi.mock('@/plugins/api/apiClient', …)`, reset with `vi.resetAllMocks()` in `beforeEach`, and wrap payloads with a local `createResponse` helper.
- Assert the URL and payload with `toHaveBeenCalledWith` or `mock.calls`. For uploads, assert the `FormData` contents.

```ts
vi.mock('@/plugins/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const createResponse = <T>(data: T): { data: T } => ({ data });

beforeEach(() => {
  vi.resetAllMocks();
});
```
