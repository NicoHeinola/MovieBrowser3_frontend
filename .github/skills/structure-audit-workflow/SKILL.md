---
name: structure-audit-workflow
description: Audit or refactor file ownership and namespace layout in this repository. Use when reorganizing files, checking whether code lives in the right folder, or preventing structure drift as features grow.
---

# Structure Audit Workflow

Use this skill when the task is about where code should live, not just what the code should do.

## Workflow

1. Identify the current namespace and its responsibility.
2. Check whether the file's behavior matches that namespace's ownership.
3. Decide whether the fix is to keep the file, split it, extract a sibling file, or move it to a different namespace.
4. Preserve imports and public boundaries with the smallest possible structural change.
5. Recheck barrel exposure, test adjacency, and route or store ownership after the move.

## Common Smells

- Route-level pages containing reusable feature markup.
- Components owning fetch or cache orchestration.
- Stores hiding backend contract definitions.
- Theme tokens scattered into feature components.
- Generic utility files accumulating unrelated helpers.

## Completion Checklist

- Each file has a clear owning namespace.
- No new catch-all files were introduced.
- Public barrels remain deliberate and small.
- Follow-up cleanup tasks are called out if a full refactor would be too large for the current change.
