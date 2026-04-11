---
description: General Vue single-file component structure rules for src .vue files. Use when editing component or page SFC files.
applyTo: 'src/**/*.vue'
---

# Vue File Structure and Ordering

## General Order

- **Use `<script setup lang="ts">` by default.**
- **Script section first, template section last.**
- **Order inside `<script setup>` or `<script>`:**
  1. Imports (external, then internal)
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

## Component Interfaces

- **Do not declare named TypeScript interfaces or types inside `.vue` files.**
- Move component-local interfaces and named types into a separate `.ts` file within the same namespace folder, even when they are only used by that one component.
- Small inline generic shapes are still acceptable directly in Vue macros when they are not introducing a reusable named type, for example `defineProps<{ foo: string }>()`.
- Name the sibling `.ts` file after what it represents (e.g. `navigationLinkItem.ts`, not `types.ts`).

```
components/
  layouts/
    top-navigation/
      TopNavigation.vue
      navigationLinkItem.ts   ✓ interface lives here, not in the .vue file
```

## Styling

- Keep styles `scoped` unless the component is intentionally providing global styling.
- Prefer moving reusable visual tokens to shared styles or the Vuetify theme instead of hard-coding them per component.
- Prefer existing Vuetify utility classes, component props, and built-in transitions before adding custom SCSS in Vue components.
- For small one-off component adjustments, prefer inline styles over introducing a new `<style>` block.
- Add a component `<style>` block only when the layout or styling is too specific or too complex to express cleanly with Vuetify utilities and inline styles.

## Example

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, watch, onMounted } from 'vue';
import MyComponent from '@/components/MyComponent.vue';

// 2. Props
defineProps<{ foo: string }>();

// 3. v-model
defineModel<string>('bar');

// 4. Local state
const count = ref(0);

// 5. Composables / injected dependencies

// 6. Computed
const doubled = computed(() => count.value * 2);

// 7. Functions
const increment = () => {
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
