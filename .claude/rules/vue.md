---
description: General Vue single-file component structure rules for src .vue files. Use when editing component or page SFC files.
paths:
  - 'src/**/*.vue'
applyTo: 'src/**/*.vue'
---

# Vue File Structure and Ordering

## General Order

- **Use `<script setup lang="ts">` by default.**
- **Script section first, template section last.**
- **Order inside `<script setup>` or `<script>`:**
  1. Imports: `import type` lines first, then value imports. External packages before `@/` aliases, `@/` aliases before `./` siblings. Import components from their namespace barrel (`@/components/common/base-form`), not the `.vue` file.
  2. Define props
  3. Define v-model bindings
  4. Local refs and plain state
  5. Composable calls and injected dependencies
  6. Computed values
  7. Functions (methods)
  8. Watchers
  9. Lifecycle hooks (onMounted, etc.)
  10. Other code (e.g., event listeners, side effects)
- **Template section** should be at the end of the file.

## Good Script Order

- Keep `ref(...)` declarations together before derived state.
- Place composable results such as `useDisplay()`, `useRoute()`, `useRouter()`, or snackbar/dialog APIs after local refs so dependencies are visible before computed state.
- Put `computed(...)` values after the refs and composables they depend on.
- Declare async loaders, event handlers, and helper methods before `watch(...)` and `onMounted(...)`.
- Keep `watch(...)` close to the state it synchronizes, but still below computed values and methods.
- Keep `onMounted(...)` and other lifecycle hooks near the end of the script block.

```vue
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';

const shows = ref<Show[]>([]);
const selectedShow = ref<Show | null>(null);

const { showAPIErrorSnackbar } = useCommonSnackbar();
const { xxl, xlAndUp, lgAndUp, smAndUp } = useDisplay();

const continueWatchingCols = computed<number>(() => {
  if (xxl.value) return 5;
  if (xlAndUp.value) return 4;
  if (lgAndUp.value) return 3;
  if (smAndUp.value) return 2;
  return 1;
});

const loadShows = async (): Promise<void> => {
  try {
    // ...
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

watch(selectedShow, () => {
  // ...
});

onMounted(() => {
  void loadShows();
});
</script>
```

```vue
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

const loadShows = async (): Promise<void> => {
  // Avoid putting methods before the state they depend on.
};

const shows = ref<Show[]>([]);

watch(shows, () => {
  // Avoid placing watchers before computed values and methods.
});

const totalShows = computed<number>(() => shows.value.length);

onMounted(() => {
  void loadShows();
});
</script>
```

## Template Conventions

- **Always use kebab-case for custom component names in templates**, not PascalCase or camelCase.

```vue
<!-- correct -->
<show-banner :selected-show="show" />

<!-- incorrect -->
<showBanner :selected-show="show" />
<ShowBanner :selected-show="show" />
```

- **Attribute order** (ESLint-enforced, alphabetical within each group): `v-for` → `v-model` → `:bound` → static → boolean → `@events` → `:key` / `ref` → `v-if` / `v-else` **last**.

```vue
<v-text-field
  v-model="category.name"
  :rules="rules.name"
  class="required"
  label="Name"
  clearable
  @blur="validate"
  ref="nameField"
  v-if="isEditing"
/>
```

- **Never use `.value` for refs in templates.** Vue automatically unwraps refs in templates. Using `.value` will cause incorrect behavior or errors.

```vue
<!-- correct -->
<div>{{ count }}</div>

<!-- incorrect -->
<div>{{ count.value }}</div>
```

## Form Wrappers

- When a feature form component uses `BaseForm` as its root node, do not add a local `submit` emit just to forward the event.
- Let the submit listener pass through to the root `BaseForm`, and let submit buttons target the form via the form `id` and native `type="submit"`.
- Only declare a component `submit` emit when the wrapper is intentionally transforming payloads or exposing a different event contract than the root form.

```vue
<script setup lang="ts">
import { BaseForm } from '@/components/common/base-form';

const props = defineProps<{
  id: string;
}>();

const isValid = defineModel<boolean>('isValid', {
  default: false,
});
</script>

<template>
  <base-form v-model:is-valid="isValid" :id="props.id">
    <slot />
  </base-form>
</template>
```

```vue
<script setup lang="ts">
import { BaseForm } from '@/components/common/base-form';

const props = defineProps<{
  id: string;
}>();

const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const emit = defineEmits<{
  submit: [];
}>();

const handleSubmit = (): void => {
  emit('submit');
};
</script>

<template>
  <base-form v-model:is-valid="isValid" @submit="handleSubmit" :id="props.id">
    <slot />
  </base-form>
</template>
```

```vue
<template>
  <default-background-form v-model:is-valid="isValid" v-model:request="request" :id="formId" @submit="handleSubmit" />

  <v-btn :disabled="!isValid" :form="formId" color="primary" type="submit"> Save </v-btn>
</template>
```

- Mark required inputs with `class="required"`.
- Validation rules come from the sibling `<feature>Rules.ts`: `const rules = getRules();`, then `:rules="rules.name"`.

## Mutations

- There is no `useMutation`. Call the service directly, show errors with the snackbar and reset the saving flag in `finally`. Then `refetch()` the query, or let the dialog result trigger it.

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

- Confirm a delete with `useConfirmDialog().confirm({...})` before calling the service.

## Sortable Lists

- Make a list sortable with `useSortableItems` on its container and render the rows it returns, each in a `SortableItem` with a `.handle` element inside. Render the returned draft, not the source list, and find a row's source index with `indexOf`, because the two differ during a drag.
- Turn dragging off with `isDisabled`, not by removing `.handle`: without a handle the row itself takes keyboard drags.
- Don't set a drag group: each list only trades with itself by default.
- Keys come from the backend id, or `getUnsavedRowKey` for rows without one. Don't use `crypto.randomUUID()`: it is missing over plain HTTP on the LAN.

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

- **Do not declare named TypeScript interfaces or types inside `.vue` files.**
- For small single-use prop or emit shapes, prefer inline Vue macro generics directly in the `.vue` file, for example `defineProps<{ foo: string }>()`.
- Extract a named sibling `.ts` type only when the shape is reused across files or is large enough that the inline macro becomes hard to read.
- Name the sibling `.ts` file after what it represents (e.g. `navigationLinkItem.ts`, not `types.ts`).

```
components/
  layouts/
    top-navigation/
      TopNavigation.vue
      navigationLinkItem.ts   ✓ reused or substantial named type lives here
```

## Styling

- Keep styles `scoped` unless the component is intentionally providing global styling.
- Comments: JSDoc (`/** ... */`) goes on props, emits, functions and top-level `<script setup>` state, with `@param` and `@returns` on functions. `//` goes inside logic: statements, callback and watcher bodies, and option keys.
- Prefer moving reusable visual tokens to shared styles or the Vuetify theme instead of hard-coding them per component.
- A primary button that finishes what the user is in (dialog Save, wizard Next, filter drawer results, login) is `variant="flat"`. Primary buttons that are just available on a page stay tonal, the app default. Inside `v-card-actions` and `card-action-bar` buttons default to `text`, so always set a variant there.
- Do not repeat local `density` or similar shared visual props in feature components. Recurring defaults live in `src/plugins/vuetify/ComponentDefaults.ts`.
- Spacing utilities (margin, padding and gap, such as `pa-*`, `mt-*`, `ga-*`) use even steps such as 2 and 4, plus 5 (20px), which matches Vuetify's dialog and toolbar insets (`base-dialog` uses `pa-5`). Never use 1, 3, 7 or other odd steps. ESLint enforces this with `vue/no-restricted-class`.
- Space siblings with a flex container and gap (`d-flex ga-2 align-center`), not margins on a child (`ml-2`, `mr-4`). Use margins only when there is no shared parent to flex.
- A button next to an input sits beside it in a `d-flex ga-2` row, not in the input's `#append` slot.
- Show an image or video together with its URL field or link in `media-preview-card`.
- Empty and info `v-alert`s shrink to their content with `class="flex-0-1"`; never let them stretch across the row.
- `v-icon` uses a named size (`x-small`, `small`, `default`, `large`, `x-large`), never a pixel number like `size="20"`. Named sizes scale with the font, so icons that must match sit outside `text-*` classes.
- Never use "·" as a separator in UI copy. Write it out ("Version 1.0.0, released 1.11.2026") or split it into separate elements.
- Typography uses Vuetify 4's MD3 scale (`text-body-*`, `text-label-*`, `text-title-*`). MD2 classes such as `text-caption`, `text-body-1` and `text-h6` no longer exist, and ESLint rejects them. Style single-class text with plain utilities (`text-medium-emphasis`, `text-truncate`). Use `heading-text` for a heading with a muted subtitle, `highlight-text` for colored bold words inside a sentence and `media-placeholder` for an icon-and-text stand-in where an image or video is missing.
- For async loading UI, use a Vuetify component's built-in `loading` prop when available; otherwise use `v-skeleton-loader`.
- `src/styles/main.scss` delays every `v-skeleton-loader` globally so fast loads show nothing. Do not add per-component delays.
- Exception: the route-change loader in `App.vue` uses `v-progress-linear`, because it belongs to no component with a `loading` prop.
- Do not introduce any other loading treatment in Vue components or pages, including custom spinner components, custom shimmer markup, standalone progress indicators, or bespoke overlays.
- Prefer existing Vuetify utility classes, component props, and built-in transitions before adding custom SCSS in Vue components.
- Do not add local `<style>` blocks or named CSS classes in Vue files unless Vuetify props, existing utility classes, and inline `style` or `:style` bindings cannot express the requirement cleanly.
- For simple decorative or layout helpers such as page backgrounds and overlays, prefer standalone sibling components inside a `position-relative` container rather than slot wrappers that also own page content.
- Avoid introducing custom CSS classes for one-off backgrounds, overlays, positioning, sizing, or z-index management in Vue files. Prefer Vuetify utility classes and inline `style` or `:style` bindings first.
- Reusable visual helper components may use a small local class or modifier when that keeps decorative styling clearer than a large inline style object.
- For small one-off component adjustments, prefer inline styles over introducing a new `<style>` block.
- Add a component `<style>` block only when the layout or styling is too specific or too complex to express cleanly with Vuetify utilities and inline styles.

## Example

```vue
<script setup lang="ts">
// 1. Imports
import { computed, onMounted, ref, watch } from 'vue';

import { MyComponent } from '@/components/common/my-component';

// 2. Props
defineProps<{ foo: string }>();

// 3. v-model
defineModel<string>('bar');

// 4. Local state
const count = ref<number>(0);

// 5. Composables / injected dependencies

// 6. Computed
const doubled = computed<number>(() => count.value * 2);

// 7. Functions
const increment = (): void => {
  count.value++;
};

// 8. Watchers
watch(count, (newVal) => {
  // ...
});

// 9. Lifecycle hooks
onMounted(() => {
  // ...
});

// 10. Other
// ...
</script>

<template>
  <!-- ... -->
</template>
```
