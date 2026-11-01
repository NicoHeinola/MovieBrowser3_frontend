---
name: test-workflow
description: Write or update Vitest tests for this frontend. Use when adding utility, service or component tests, or regression coverage for a change that raises behavioral risk.
---

# Test Workflow

Utilities under `src/utils` and services always get tests. Component tests are opt-in: add them when the task asks for it or the behavior is risky.

## Workflow

1. Name the riskiest behavior the change introduced: parsing, mapping, cache updates, store state or a UI state transition.
2. Copy the closest existing test in the nearest `__tests__` folder (services: `services/show/__tests__/showLinkService.test.ts`).
3. Stub only the edges: `apiClient`, router, Vuetify display state, browser APIs, `import.meta.env`.
4. Assert behavior and state transitions, not snapshots.
5. Run `npx vitest run <path>` first, then `npm test` if shared code changed.

## Done when

- The riskiest behavior has a direct assertion, including its failure branch.
- Tests pass, and any coverage gap is stated in the hand-off.
