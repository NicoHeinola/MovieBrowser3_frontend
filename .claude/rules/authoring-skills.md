---
description: Authoring rules for project SKILL.md files. Use when creating or editing concept-driven skills under .claude/skills.
paths:
  - '.claude/skills/**'
applyTo: '.claude/skills/**'
---

# Authoring Skills

## What Skills Are For

- Skills encode **concept-driven** knowledge — patterns, workflows, and domain expertise that are not tied to a single file type or location.
- Use a skill when the guidance spans multiple steps, multiple file types, or requires contextual reasoning rather than a fixed structural rule.
- Skills can and should reference other files, folders, or concepts as needed.
- Use `description` to state both the capability and the situations that should trigger the skill automatically.
- Prefer short step-oriented sections over large paragraphs so the workflow is easy to follow in chat.
- Use examples to clarify a decision or workflow branch, not to restate a rule's structural pattern.

## When to Use a Rule Instead

Use a **rule** when:

- The rule is **file-specific** — it describes the required structure, ordering, or naming of a particular file type.
- The guidance maps cleanly to a set of `paths` globs and only needs to reference the matched files themselves.

> Rule of thumb: if the rule can be expressed as "files matching X must look like Y", it belongs in a rule, not a skill.

## What Skills Are NOT For

- Do not mirror a single rule file with a longer checklist.
- Do not use a skill as a thin wrapper around an agent prompt when the task does not need delegated context.
