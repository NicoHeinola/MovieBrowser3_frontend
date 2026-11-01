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

## i18n

- `vue-i18n` (`src/plugins/i18n/en.json`) is used mainly for enum labels, such as `showEntry.type.*` and `showLink.type.*`. Most UI copy is still inline English.

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
- Do not repeat local `density` or similar shared visual props in feature components. Recurring defaults live in `src/plugins/vuetify/ComponentDefaults.ts`.
- Spacing utilities (margin, padding and gap, such as `pa-*`, `mt-*`, `ga-*`) use even steps such as 2 and 4, plus 5 (20px), which matches Vuetify's dialog and toolbar insets (`base-dialog` uses `pa-5`). Never use 1, 3, 7 or other odd steps. ESLint enforces this with `vue/no-restricted-class`.
- Typography uses Vuetify 4's MD3 scale (`text-body-*`, `text-label-*`, `text-title-*`). MD2 classes such as `text-caption`, `text-body-1` and `text-h6` no longer exist, and ESLint rejects them. Style single-class text with plain utilities (`text-medium-emphasis`, `text-truncate`). Use `heading-text` for a heading with a muted subtitle and `media-placeholder` for an icon-and-text stand-in where an image or video is missing.
- For async loading UI, use a Vuetify component's built-in `loading` prop when available; otherwise use `v-skeleton-loader`.
- Exception: the route-change loader in `top-navigation` uses `v-progress-linear`, because `v-app-bar` has no `loading` prop.
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
