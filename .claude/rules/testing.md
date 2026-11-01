---
description: Test file structure rules for Vitest and JSDOM suites under src. Use when editing files in __tests__ folders.
paths:
  - 'src/**/__tests__/*.test.ts'
applyTo: 'src/**/__tests__/*.test.ts'
---

# Test File Structure

## Placement and Naming

- Place each test file in a `__tests__` folder adjacent to the implementation namespace it verifies.
- Name test files `[implementation-name].test.ts`.
- Utility namespaces should keep one test file per utility implementation file.

Example:

```
src/utils/css/
  parseCssNumeric.ts
  __tests__/
    parseCssNumeric.test.ts
```

## Test Shape

- Use Vitest APIs for assertions, stubs, and mocks.
- Keep test setup local to the file unless the same helper is reused across multiple sibling tests.
- Mock only the external edges needed to isolate the behavior under test.

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

## Environment Edges

- DOM-oriented tests may rely on JSDOM.
- When a test depends on `import.meta.env`, stub that edge explicitly in the test file instead of coupling the test to ambient process state.
