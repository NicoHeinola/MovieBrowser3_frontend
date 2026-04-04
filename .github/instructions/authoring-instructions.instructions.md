---
description: Rules for writing .instructions.md files and when to use instructions vs skills.
applyTo: '.github/instructions/**'
---

# Authoring Instructions

## What Instructions Are For

- Instructions describe **file-specific rules** — structure, ordering, naming conventions, or patterns that apply directly to the files matched by `applyTo`.
- An instruction file should only talk about the files it is applied to. Never reference other files, other instruction files, or concepts that live outside the matched scope.
- Keep instructions narrow and concrete. One instruction file per concern (e.g. Vue file structure, TypeScript style, namespacing).

## What Instructions Are NOT For

- Instructions are not the right place for multi-step workflows, reusable processes, or domain knowledge that spans many file types.
- Do not use instructions to encode "how to do X" — that belongs in a skill.
