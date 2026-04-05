---
description: Pinia store file rules for src/stores. Use when creating or editing client state modules.
applyTo: 'src/stores/**/*.ts'
---

# Store Rules

## Store Shape

- Keep one store per file or namespace entry point.
- Name stores with the `useXStore` convention.
- Type state, action inputs, and derived values explicitly.

## Responsibilities

- Put async fetching, persistence, and mutation logic in store actions.
- Keep components focused on presentation and event wiring rather than duplicating store logic.
- Do not hide backend contracts inside stores; import shared contracts from `src/interfaces/api`.

## Growth Path

- When a store gains related helper types or selectors, keep them in the same store namespace rather than scattering them across unrelated folders.
