---
description: Authoring rules for path-scoped rule files under .claude/rules. Use when creating or editing file-specific rules.
paths:
  - '.claude/rules/**'
applyTo: '.claude/rules/**'
---

# Authoring Rules

## What Rules Are For

- Rules describe **file-specific conventions**: structure, ordering, naming, or patterns that apply directly to the files matched by `paths`.
- A rule should only talk about the files it is applied to. Never reference other rule files or concepts that live outside the matched scope.
- Keep rules narrow and concrete. One rule file per concern (e.g. Vue file structure, TypeScript style, namespacing).
- Prefer examples whenever a structure rule is easier to show than describe. Short examples are better than extra rationale.
- When repository conventions change, update every affected rule in the same change so the guidance stays aligned with the codebase.

## Frontmatter

- `paths` is a YAML list of globs. Claude Code loads the rule when it reads or edits a matching file. Rules load on read too, so keep `paths` specific and avoid `**` unless the rule truly applies everywhere.
- `applyTo` repeats the same globs as one comma-separated string for Copilot. Keep it in sync with `paths`.
- `description` says when the rule applies, with plain-language trigger phrases such as "store files" or "Vue component structure". Copilot uses it for discovery; Claude ignores it.

```md
---
description: Vue component and page layout rules. Use when editing component or page SFC files.
paths:
  - 'src/components/**/*.vue'
  - 'src/pages/**/*.vue'
applyTo: 'src/components/**/*.vue,src/pages/**/*.vue'
---
```

## What Rules Are NOT For

- Rules are not the right place for multi-step workflows, reusable processes, or domain knowledge that spans many file types.
- Do not use rules to encode "how to do X". That belongs in a skill.
- Do not use rules as thin architecture documents, review checklists, or agent prompts.
