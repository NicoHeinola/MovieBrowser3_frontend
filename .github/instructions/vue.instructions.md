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
  4. Variables and computed properties
  5. Functions (methods)
  6. Watchers
  7. Lifecycle hooks (onMounted, etc.)
  8. Other code (e.g., event listeners, side effects)
- **Template section** should be at the end of the file.

## Template Conventions

- **Always use kebab-case for custom component names in templates**, not PascalCase.

```vue
<!-- correct -->
<show-banner :selected-show="show" />

<!-- incorrect -->
<ShowBanner :selected-show="show" />
```

- **Never use `.value` for refs in templates.** Vue automatically unwraps refs in templates. Using `.value` will cause incorrect behavior or errors.

```vue
<!-- correct -->
<div>{{ count }}</div>

<!-- incorrect -->
<div>{{ count.value }}</div>
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

// 4. Variables / Computed
const count = ref(0);
const doubled = computed(() => count.value * 2);

// 5. Functions
const increment = () => {
  count.value++;
};

// 6. Watchers
watch(count, (newVal) => {
  // ...
});

// 7. Lifecycle hooks
onMounted(() => {
  // ...
});

// 8. Other
// ...
</script>

<template>
  <!-- ... -->
</template>
```
