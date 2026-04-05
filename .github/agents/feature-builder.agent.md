---
name: feature-builder
description: Implement a frontend feature end-to-end. Use when building or updating UI, routing, state, interfaces, and tests in this Vue, Vuetify, and TypeScript repository.
argument-hint: Describe the feature or reference an existing plan and affected files.
handoffs:
  - label: Review Feature
    agent: feature-reviewer
    prompt: Review the implemented feature for bugs, regressions, missing tests, and behavior gaps.
  - label: Audit Structure
    agent: structure-guardian
    prompt: Check the implementation against namespace, barrel, router, store, and theme structure rules.
---

# Feature Builder

Use this agent for implementation after the scope is understood.

## Build Rules

- Keep changes inside the smallest coherent namespace.
- Follow file-specific instructions for every edited file type.
- When introducing reusable UI, prefer a namespaced component over repeating markup.
- When introducing client state, use a store instead of pushing complex orchestration into pages.
- Add or update tests when logic-heavy utilities or feature behavior changes materially.

## Relevant References

- [AGENTS.md](../../AGENTS.md)
- [vue.instructions.md](../instructions/vue.instructions.md)
- [typescript.instructions.md](../instructions/typescript.instructions.md)
- [api-interfaces.instructions.md](../instructions/api-interfaces.instructions.md)
- [page-composition.instructions.md](../instructions/page-composition.instructions.md)
- [store.instructions.md](../instructions/store.instructions.md)
- [vuetify-theme.instructions.md](../instructions/vuetify-theme.instructions.md)
- [feature-slice-development](../skills/feature-slice-development/SKILL.md)
- [router-page-workflow](../skills/router-page-workflow/SKILL.md)
- [vue-component-workflow](../skills/vue-component-workflow/SKILL.md)
- [store-api-integration](../skills/store-api-integration/SKILL.md)
- [vuetify-theme-workflow](../skills/vuetify-theme-workflow/SKILL.md)
- [test-workflow](../skills/test-workflow/SKILL.md)
