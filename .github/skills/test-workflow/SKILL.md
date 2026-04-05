---
name: test-workflow
description: Write or update Vitest-based tests for this repository. Use when adding utility tests, component tests, or regression coverage for feature work.
---

# Test Workflow

Use this skill when testing work is part of the task or when a change increases behavioral risk.

## Workflow

1. Identify the highest-risk logic or behavior introduced by the change.
2. Place tests in the nearest `__tests__` folder adjacent to the implementation namespace.
3. Prefer one test file per utility file.
4. Mock only the external edges that are necessary for the test.
5. Run the narrowest useful test command first, then widen if needed.

## Repository-Specific Focus

- Utilities in `src/utils` should have direct test coverage.
- Component tests should focus on behavior and state transitions, not just rendered snapshots.
- When a feature depends on router, Vuetify display state, or browser APIs, stub those edges explicitly.

## Useful Commands

- `npm test`
- `npm run test:ui`
- `npm run test:coverage`
