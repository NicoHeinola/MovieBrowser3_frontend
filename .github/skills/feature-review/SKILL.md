---
name: feature-review
description: Review a frontend feature or change set for bugs, regressions, missing tests, and structure drift. Use when asked to review made changes, inspect local edits or a diff, or audit whether a change is safe to merge.
---

# Feature Review

Use this skill when the main task is to evaluate an implementation or a set of recent changes rather than write it.

## Audit Scope

- Review the changed files first, then expand only as far as needed to understand the affected boundaries.
- Treat local edits, staged changes, diffs, and in-progress feature work as valid audit inputs.
- Focus on whether the current change set is safe to keep, merge, or build on.

## Review Order

1. Confirm the intended behavior.
2. Inspect the changed files, namespaces, and their ownership.
3. Check user-visible states, edge cases, and nullability.
4. Check tests, validation, and likely regressions.
5. Report findings first, ordered by severity.
6. Call out any residual audit gaps if the change could not be fully validated.

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
- Keep the audit concise and biased toward actionable merge risk rather than broad codebase commentary.
