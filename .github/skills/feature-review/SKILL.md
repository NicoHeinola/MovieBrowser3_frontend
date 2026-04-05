---
name: feature-review
description: Review a frontend feature for bugs, regressions, missing tests, and structure drift. Use when asked to review a feature, inspect a diff, or audit whether a change is safe to merge.
---

# Feature Review

Use this skill when the main task is to evaluate an implementation rather than write it.

## Review Order

1. Confirm the intended behavior.
2. Inspect the changed namespaces and their ownership.
3. Check user-visible states, edge cases, and nullability.
4. Check tests, validation, and likely regressions.
5. Report findings first, ordered by severity.

## High-Risk Areas In This Repository

- Page components accumulating feature logic that should move to components or stores.
- API contracts drifting away from backend field names.
- Route changes that bypass page namespaces.
- Theme choices hard-coded into components instead of the Vuetify plugin.
- Utility growth without matching tests.

## Output Format

- Findings first.
- Each finding should identify the risk, affected file or boundary, and what should change.
- If no findings are discovered, state that explicitly and mention any residual testing or validation gaps.
