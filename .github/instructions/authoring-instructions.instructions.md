---
description: Authoring rules for workspace .instructions.md files. Use when creating or editing file-specific instructions under .github/instructions.
applyTo: '.github/instructions/**'
---

# Authoring Instructions

## What Instructions Are For

- Instructions describe **file-specific rules** — structure, ordering, naming conventions, or patterns that apply directly to the files matched by `applyTo`.
- An instruction file should only talk about the files it is applied to. Never reference other files, other instruction files, or concepts that live outside the matched scope.
- Keep instructions narrow and concrete. One instruction file per concern (e.g. Vue file structure, TypeScript style, namespacing).
- Use `description` as the discovery surface. Include plain-language trigger phrases such as "store files", "router files", or "Vue component structure".
- Keep `applyTo` specific. Avoid `**` unless the rule truly applies everywhere.
- Prefer examples whenever a structure rule is easier to show than describe. Short examples are better than extra rationale.
- When repository conventions change, update every affected instruction file in the same change so customization guidance stays aligned with the codebase.

## What Instructions Are NOT For

- Instructions are not the right place for multi-step workflows, reusable processes, or domain knowledge that spans many file types.
- Do not use instructions to encode "how to do X" — that belongs in a skill.
- Do not use instructions as thin architecture documents, review checklists, or agent prompts.
