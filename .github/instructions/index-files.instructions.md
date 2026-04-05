---
description: Barrel file rules for src index.ts files. Use when creating or editing namespace entry points.
applyTo: 'src/**/index.ts'
---

# Index File Rules

## Purpose

- `index.ts` should expose a deliberate public surface for a namespace.
- Re-export only the small set of symbols that other namespaces should import directly.

## Limits

- Do not turn `index.ts` into a dumping ground for unrelated exports.
- Utility namespaces should usually skip `index.ts` and import files directly.
- If a namespace only has one consumer and no reuse boundary, prefer direct imports over adding a barrel.
