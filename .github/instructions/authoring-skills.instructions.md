---
description: Rules for writing SKILL.md files and when to use skills vs instructions.
applyTo: '.github/skills/**'
---

# Authoring Skills

## What Skills Are For

- Skills encode **concept-driven** knowledge — patterns, workflows, and domain expertise that are not tied to a single file type or location.
- Use a skill when the guidance spans multiple steps, multiple file types, or requires contextual reasoning rather than a fixed structural rule.
- Skills can and should reference other files, folders, or concepts as needed.

## When to Use an Instruction Instead

Use an **instruction** when:

- The rule is **file-specific** — it describes the required structure, ordering, or naming of a particular file type.
- The guidance maps cleanly to a single `applyTo` glob and only needs to reference the matched files themselves.

> Rule of thumb: if the rule can be expressed as "files matching X must look like Y", it belongs in an instruction, not a skill.
