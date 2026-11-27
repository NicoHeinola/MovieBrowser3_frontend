---
paths:
  - 'src/**/*.vue'
---

# Vue File Rules

## Script Order

`<script setup lang="ts">` first, template last. Inside the script, in this order:

```vue
<script setup lang="ts">
// 1. Imports (components from their namespace barrel, such as `@/components/common/base-form`)
import { computed, onMounted, ref, watch } from 'vue';

import { MyComponent } from '@/components/common/my-component';

// 2. Props
defineProps<{ foo: string }>();

// 3. v-model
defineModel<string>('bar');

// 4. Local refs and plain state
const count = ref<number>(0);

// 5. Composables and injected dependencies (useDisplay, useRoute, snackbar and dialog APIs)

// 6. Computed
const doubled = computed<number>(() => count.value * 2);

// 7. Functions: loaders, handlers, helpers
const increment = (): void => {
  count.value++;
};

// 8. Watchers
watch(count, () => {
  // ...
});

// 9. Lifecycle hooks
onMounted(() => {
  // ...
});

// 10. Other code (event listeners, side effects)
</script>

<template>
  <!-- ... -->
</template>
```

## Template

- Custom components are kebab-case in templates: `<show-banner :selected-show="show" />`, never `<ShowBanner>` or `<showBanner>`.
- When an element's text doesn't fit on one line, put `{{ ... }}` on a line of its own between the tags. Don't split it as `>{{` newline `t('key')` newline `}}<`. Prettier keeps the readable form as long as there is whitespace inside the tag.

```vue
<span class="text-medium-emphasis">
  {{ t('show.dropEpisodeFilesHint') }}
</span>
```

## Forms

- A `*-form` component only shows fields: `v-model:request`, `v-model:isValid` and props for what it displays (saved state, check results). It never calls services or stores. Its caller checks and saves: the page or dialog, or a composable when several screens share the save (`useDownloadClientSettings` for Settings and the setup wizard).
- A form whose root is `base-form` declares no `submit` emit just to forward it: the listener falls through to `base-form`, and the submit button targets the form by `id` with `type="submit"`. Declare `submit` only when the form changes the payload or the event contract.

```vue
<template>
  <default-background-form v-model:is-valid="isValid" v-model:request="request" @submit="handleSubmit" :id="formId" />

  <v-btn :disabled="!isValid" :form="formId" color="primary" type="submit"> Save </v-btn>
</template>
```

- Mark required inputs with `class="required"`.
- Validation rules come from the sibling `<feature>Rules.ts`: `const rules = getRules();`, then `:rules="rules.name"`.

## Mutations

- There is no `useMutation`. Call the service directly, show errors with the snackbar and reset the saving flag in `finally`. Then `refetch()` the query, or let the dialog result trigger it.
- Confirm a delete with `useConfirmDialog().confirm({...})` before calling the service.

```ts
const save = async (): Promise<void> => {
  isSaving.value = true;

  try {
    await categoryService.update(category.value.id, request);
    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};
```

## Dialogs

- Open application dialogs with `useDialog().showDialog(...)`, through the dialog provider (`src/components/layouts/dialog-provider`), and keep dialog components compatible with it. Never mount a feature dialog inline in a page or template.

## Sortable Lists

- Make a list sortable with `useSortableItems` on its container and render the rows it returns, each in a `SortableItem` with a `.handle` element inside. Render the returned draft, not the source list, and find a row's source index with `indexOf`, because the two differ during a drag.
- Turn dragging off with `isDisabled`, not by removing `.handle`: without a handle the row itself takes keyboard drags.
- Don't set a drag group: each list only trades with itself by default.
- Keys come from the backend id, or `getUnsavedRowKey` for rows without one. `crypto.randomUUID()` is missing over plain HTTP on the LAN; ESLint blocks it.

## i18n

- All UI copy goes through `vue-i18n`: messages live in `src/plugins/i18n/en.json` and `fi.json`, which must have the same keys (a test checks it). Add a key to both files.
- In components use `const { t } = useI18n();` and `t('area.key')`. In plain `.ts` files (rules, utils, option lists) use `i18n.global.t(...)` at call time, not at module load, so the text follows the active language. Constant lists store i18n keys (`titleKey`) and the component that shows them calls `t()`. Arrays of translated texts inside a component (table headers, select items) are `computed`, so they update when the language changes.
- Use `i18n-t` with named slots for messages that contain markup, and the plural form (`t(key, { count }, count)`) for counts. Put each slot's content on its own line, so Prettier doesn't hug the tags:

```vue
<template #name>
  <span class="font-weight-medium">{{ name }}</span>
</template>
```

- Language state lives in `useLocale` (`src/composables/locale`); the choice is stored in `localStorage`. Add new languages to `AppLocale`, `languageOptions` and a new locale file.
- The changelog entries in `src/data/changelog` are English only.

## Component Interfaces

- No named TypeScript interfaces or types inside `.vue` files. Small single-use prop or emit shapes are inline macro generics: `defineProps<{ foo: string }>()`.
- Props that extend another type (a dialog's `DialogComponentProps<T>` plus its own props) get a sibling `<component>Props.ts` interface (`malSearchDialogProps.ts`), not an intersection inside `defineProps<...>`, which some editors' Vue tooling can't parse.
- A shape reused across files, or too large to read inline, gets a sibling `.ts` file named after what it is (`navigationLinkItem.ts`, not `types.ts`).
- State that a feature's root shares with parts several levels down, which the parts in between never use, goes through `provide` with a typed `InjectionKey` in the root's folder plus a small `inject…` helper that returns a safe default (the show editor's torrents: `showEditorDownloadsKey`, `injectShowEditorDownloads`). A prop or v-model that every level uses, such as the show draft, stays a prop.
- There is one show drawer, mounted in `App.vue`. Open a show in it with `useShowDrawerStore().open(showId)`, from any page or component; never mount another `selected-show-drawer`. A button that belongs only to the caller goes in as `open(showId, { action: SomeButton })`, a component that wires up itself.
- Action buttons that only emit back to the parent go in a named slot that the parent fills and wires up itself, such as `show-editor-hero`'s `#actions`. Otherwise every new action adds an emit to the child, plus props like `isDeleting` that exist only to pass the button's state through. The child keeps the placement, and uses `defineSlots` with `v-if="$slots.actions"` around the slot.

## Comments

- JSDoc (`/** ... */`) goes on props, emits, functions and top-level `<script setup>` state, with `@param` and `@returns` on functions. `//` goes inside logic: statements, callback and watcher bodies, and option keys.

## Styling

- Style with Vuetify props, utility classes and built-in transitions first, then inline `style` or `:style`. Add a `scoped` `<style>` block or a named class only when those can't express it cleanly. A reusable visual helper may keep a small local class.
- Decorative helpers (page backgrounds, overlays) are standalone sibling components inside a `position-relative` container, not slot wrappers that also own the page content.
- Reusable visual tokens go in the Vuetify theme or shared styles. Recurring defaults such as `density` live in `src/plugins/vuetify/ComponentDefaults.ts`; don't repeat them in feature components.
- A primary button that finishes what the user is in (dialog Save, wizard Next, filter drawer results, login) is `variant="flat"`. Primary buttons that are just available on a page stay tonal, the app default. Inside `v-card-actions` and `card-action-bar` buttons default to `text`, so always set a variant there.
- Spacing utilities (`pa-*`, `mt-*`, `ga-*`) use even steps such as 2 and 4, plus 5 (20px), which matches Vuetify's dialog and toolbar insets (`base-dialog` uses `pa-5`). ESLint blocks 1, 3, 7 and other odd steps.
- Space siblings with a flex container and gap (`d-flex ga-2 align-center`), not margins on a child (`ml-2`, `mr-4`). Use margins only when there is no shared parent to flex.
- A button next to an input sits beside it in a `d-flex ga-2` row, not in the input's `#append` slot.
- A full-width button at the bottom of a strongly rounded card (`rounded="xl"` or rounder, such as the show search menu) is `rounded="pill"`, so its shape follows the card's.
- Show an image or video together with its URL field or link in `media-preview-card`.
- Empty and info `v-alert`s shrink to their content with `class="flex-0-1"`; never let them stretch across the row. Empty results ("nothing matches") are such an alert, also inside lists and dialogs, never a disabled `v-list-item`.
- A field's explanation is a `mdi-help-circle` icon in its `#prepend` slot with `v-tooltip:bottom` (the settings page), not a persistent `hint`, which pushes the buttons beside the field out of line.
- A success snackbar is one short sentence. Anything the user should act on (genres without a category) goes in its own `showWarningSnackbar`.
- A common component does one thing: to group or place several, add a container component (`floating-container` around `floating-action-button`s) instead of a slot on one of them.
- `v-icon` uses a named size (`x-small`, `small`, `default`, `large`, `x-large`); ESLint blocks pixel sizes. Named sizes scale with the font, so icons that must match sit outside `text-*` classes.
- Never use "·" as a separator in UI copy (`messages.test.ts` checks the locale files). Write it out ("Version 1.0.0, released 1.11.2026") or split it into separate elements.
- Typography uses Vuetify 4's MD3 scale (`text-body-*`, `text-label-*`, `text-title-*`); ESLint rejects MD2 classes such as `text-caption`. Style single-class text with plain utilities (`text-medium-emphasis`, `text-truncate`). Use `heading-text` for a heading with a muted subtitle, `highlight-text` for colored bold words inside a sentence and `media-placeholder` for an icon-and-text stand-in where an image or video is missing.
