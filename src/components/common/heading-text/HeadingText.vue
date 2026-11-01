<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    /** Heading level: 1 for page and section titles, 2 for titles inside a card or drawer. */
    level?: 1 | 2;
  }>(),
  {
    level: 1,
  },
);
</script>

<template>
  <div>
    <div class="d-flex ga-4 align-center">
      <slot name="prepend" />
      <component :is="`h${props.level}`">{{ props.title }}</component>
      <slot name="append" />
    </div>
    <p class="text-body-medium text-medium-emphasis" v-if="props.subtitle">{{ props.subtitle }}</p>
  </div>
</template>
