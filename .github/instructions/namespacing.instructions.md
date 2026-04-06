---
description: Source tree namespacing rules for files under src. Use when creating folders, adding files, or reviewing whether a change belongs in an existing namespace.
applyTo: |
  src/**
---

# Naming and Structure Rules

## Namespacing Requirement

- New source files under `src/` should belong to a namespace folder that reflects one logical unit.
- Do **not** place new implementation files directly under broad buckets such as `src/components`, `src/pages`, `src/utils`, or `src/plugins`.
- Reuse an existing namespace when the new file clearly belongs to the same feature, component, page, or utility group.
- Split work into a new namespace when the file would otherwise introduce an unrelated responsibility.

## Folder and File Naming

- Component and page folders should use the existing kebab-case folder style (for example `show-grid`, `top-navigation`, `home`).
- Primary component files should use PascalCase names that match the concept exported by that namespace (for example `ShowGrid.vue`, `TopNavigation.vue`).
- Utility and support `.ts` files should be named after the single function, type, or concept they contain.
- Avoid generic names such as `types.ts`, `helpers.ts`, or `utils.ts` inside a namespace when a more specific name is possible.

## Barrel Files

- Use `index.ts` only when a namespace intentionally exposes a small public surface for external imports.
- Component namespaces under `src/components/common`, `src/components/features`, and `src/components/layouts` should expose a small `index.ts` barrel when they are consumed outside their own folder.
- Keep those component barrels focused on the namespace's primary component and closely related public types only.
- Do **not** add `index.ts` barrel files to utility namespaces; import utility files directly.

## Utilities

- Utility files should keep a single clear export responsibility.
- Closely related utilities may share a namespace folder, such as `env/` or `youtube/`, but unrelated helpers should not.
- Example structure:

```
src/
  components/
    MyButton/
      MyButton.vue
  utils/
    formatDate/
      formatDate.ts
    env/
      getEnvString.ts
      getEnvNumber.ts
      getEnvArray.ts
      getEnvBoolean.ts
    youtube/
      isYouTubeUrl.ts
      getYouTubeEmbedUrl.ts
```

## Rationale

- This structure enforces clear boundaries, improves maintainability, and prevents accidental coupling of unrelated code.
- Grouping closely related utilities under one namespace (e.g. `env/`) avoids over-fragmentation while still keeping concerns separate.
- It also simplifies imports and code navigation.

## Enforcement

- PRs that do not follow this structure should be updated before merging.
