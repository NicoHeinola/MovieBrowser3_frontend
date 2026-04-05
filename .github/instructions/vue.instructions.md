---
description: Instructions for Vue.js code style and conventions.
applyTo: '**/*.vue'
---

# Vue File Structure and Ordering

## General Order

- **Script section first, template section last**
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

- **Prefer placing TypeScript interfaces or types inside `.vue` files for simple, component-specific props.**
- If the interface is large, complex, or reused by other components, move it to a separate `.ts` file within the same namespace folder.
- If in a separate file, name the file after what it represents (e.g. `navigationLinkItem.ts`, not `types.ts`).

```
components/
  layouts/
    top-navigation/
      TopNavigation.vue
      navigationLinkItem.ts   ✓ interface lives here, not in the .vue file
```

## Layout

- **Use `v-row` and `v-col` for layout structure** instead of manual CSS flex/grid classes like `d-flex`, `d-grid`, `ga-*`, etc.
- Use `cols="12"` as the default full-width base; add responsive breakpoints (`lg`, `xl`, etc.) where needed.
- Utility classes (`pa-*`, `px-*`, `ma-*`, `text-*`, `position-*`, etc.) are still acceptable for spacing and element-level styling.
- Exceptions: `d-flex` and inline alignment classes are acceptable when used on small inline elements (e.g. navigation links, icon+label combos) or absolutely-positioned overlays where `v-row`/`v-col` semantics would be inappropriate.

```vue
<!-- correct -->
<v-row>
  <v-col cols="12">
    <h1>Title</h1>
  </v-col>
  <v-col cols="12" lg="4">
    <my-card />
  </v-col>
</v-row>

<!-- incorrect -->
<div class="d-flex flex-column ga-4">
  <h1>Title</h1>
  <my-card />
</div>
```

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
