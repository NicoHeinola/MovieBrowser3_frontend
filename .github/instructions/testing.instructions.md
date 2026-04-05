---
description: Guidelines for unit and component testing using Vitest and JSDOM, including organization and mocking patterns.
applyTo: 'src/**/__tests__/*.test.ts'
---

# Testing Guidelines

## Framework

- **Vitest**: used for unit and component tests.
- **JSDOM**: used for terminal-based DOM testing.

## Organization

- All tests must be located in a `__tests__` folder adjacent to the file being tested.
- **Each utility function must have its own test file** (one test file per function).
- Test files should follow the naming convention: `[filename].test.ts`.
- **Every utility file in `src/utils/` must have a corresponding test file.** When adding a new utility, always create its test file before considering the work done.

Example:

```
src/utils/css/
  parseCssNumeric.ts
  __tests__/
    parseCssNumeric.test.ts
```

## Running Tests

- `npm test`: Runs all tests once.
- `npm run test:ui`: Opens the Vitest UI for interactive debugging.
- `npm run test:coverage`: Generates a code coverage report.

## Mocking

- Use `vi.stubGlobal` or `vi.mock` for external dependencies and environment variables.
- Since we use `import.meta.env`, remember to mock `import` via `vi.stubGlobal('import', { meta: { env: { ... } } })` if necessary, though in this project we also use a mock wrapper pattern for env utilities.
