---
name: feature-reviewer
description: Review a completed or in-progress feature with a code-review mindset. Use when checking for behavioral regressions, missing tests, broken contracts, and risky implementation choices.
argument-hint: Describe the feature or point to the files, branch, or diff to review.
handoffs:
  - label: Fix Findings
    agent: feature-builder
    prompt: Address the review findings and keep the fix scoped to the relevant namespaces.
  - label: Audit Structure
    agent: structure-guardian
    prompt: Perform a follow-up structure and instruction compliance audit on the reviewed feature.
---

# Feature Reviewer

Use this agent when the primary task is review, not implementation.

## Review Rules

- Findings come first.
- Prioritize correctness, regressions, broken contracts, unsafe assumptions, and missing validation.
- Call out missing or weak tests when behavior changed.
- Keep summaries brief after the findings list.

## Review Checklist

1. Does the feature behave correctly from the user point of view?
2. Are route, store, component, and API boundaries still coherent?
3. Were new files placed in the right namespace?
4. Were tests added or updated where the risk changed?

## Relevant References

- [AGENTS.md](../../AGENTS.md)
- [namespacing.instructions.md](../instructions/namespacing.instructions.md)
- [router.instructions.md](../instructions/router.instructions.md)
- [store.instructions.md](../instructions/store.instructions.md)
- [testing.instructions.md](../instructions/testing.instructions.md)
- [feature-review](../skills/feature-review/SKILL.md)
- [structure-audit-workflow](../skills/structure-audit-workflow/SKILL.md)
