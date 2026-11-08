---
description: Edit dialog rules for entity create/edit/delete dialogs and the composables that open them. Use when creating or editing an *-edit-dialog component or a use*EditDialog composable.
paths:
  - 'src/components/features/**/*-edit-dialog/**'
  - 'src/composables/**/use*EditDialog.ts'
applyTo: 'src/components/features/**/*-edit-dialog/**,src/composables/**/use*EditDialog.ts'
---

# Edit Dialog Rules

`category-edit-dialog` is the reference dialog.

## Dialog Component

- Props are `defineProps<DialogComponentProps<boolean>>()`. Visibility is `defineModel<boolean>({ required: true })`, and the entity is a named `defineModel`.
- Wrap the content in `base-dialog` with `#title`, `#default` and `#actions` slots.
- Snapshot the original in `onMounted` with `deepClone`. On save, skip the update when `getChangedObject(original, entity)` returns `undefined`.
- Close with `props.close(true)` after a save or delete, so the caller knows to refetch.
- Confirm a delete with `useConfirmDialog().confirm({...})`.

```ts
const props = defineProps<DialogComponentProps<boolean>>();

const category = defineModel<Category>('category', { required: true });
const originalCategory = ref<Category | null>(null);

const isDialogVisible = defineModel<boolean>({ required: true });

onMounted(() => {
  if (category.value?.id) {
    originalCategory.value = deepClone<Category>(category.value);
  }
});
```

## Opening the Dialog

- The caller passes `deepClone(entity)` or an empty entity (`id: 0`) and refetches when the dialog closes with `true`.
- Websites are edited from more than one page, so their dialog opens through `useWebsiteEditDialog`. It owns the clone, the empty entity and the cache invalidation, and returns whether the dialog saved.
- Shows are too big for a dialog: they are edited on the `admin-show-edit` / `admin-show-new` pages (`show-editor` components, `useShowEditor`). Link there with `router.push` instead of opening a dialog.
