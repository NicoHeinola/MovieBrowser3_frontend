---
description: Barrel file rules for src index.ts files. Use when creating or editing namespace entry points.
applyTo: 'src/**/index.ts'
---

# Index File Rules

## Purpose

- `index.ts` should expose a deliberate public surface for a namespace.
- Re-export only the small set of symbols that other namespaces should import directly.

## Component Namespace Entry Points

- For public component namespaces under `src/components/common`, `src/components/features`, and `src/components/layouts`, `index.ts` should re-export the namespace's primary component.
- Those component namespace entry points should stay small and usually export only the primary component and any tightly related public types.
- External imports for those component namespaces should target the namespace folder so the `index.ts` file remains the public boundary.

## Limits

- Do not turn `index.ts` into a dumping ground for unrelated exports.
- Utility namespaces should usually skip `index.ts` and import files directly.
- Outside the component namespaces above, if a namespace only has one consumer and no reuse boundary, prefer direct imports over adding a barrel.
