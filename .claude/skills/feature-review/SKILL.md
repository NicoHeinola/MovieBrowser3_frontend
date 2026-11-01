---
name: feature-review
description: What to check when reviewing a frontend change in this repo (local edits, staged changes, a diff, a branch or a PR). Use when asked to review changes or judge whether a change is safe to merge. Report with the `clear-review` format when it is available.
---

# Feature Review

Review the changed files first; read further only as far as the affected boundaries need. Skip style that ESLint or Prettier already enforce.

## Workflow

1. Confirm the intended behavior (ticket, commit message or the user's ask).
2. Run `npm run check` and note the result.
3. Check correctness: user-visible states, edge cases, nullability, loading and error states.
4. Check the repo's high-risk areas:
   - Pages accumulating feature logic that belongs in components, composables or stores.
   - API interfaces drifting from backend field names, or services reshaping payloads.
   - Query keys or cache updates that leave stale data after a mutation.
   - Routes bypassing page namespaces or missing `requiresAuth` / `requiresAdmin`.
   - Theme colors or spacing hard-coded instead of the Vuetify plugin and utilities.
   - UI copy missing from `en.json` or `fi.json`, or a user-facing change without a changelog line.
   - New utilities or services without tests.
5. Report findings, most severe first, each with a concrete scenario, file reference and fix. Without `clear-review`, use the same order and say what could not be checked.

## Done when

- Every finding has a scenario and a file reference, or the report says plainly that nothing was found and what wasn't checked.
