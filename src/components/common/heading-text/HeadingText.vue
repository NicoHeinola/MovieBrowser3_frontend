<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    /** Heading level: 1 for page and section titles, 2 for titles inside a card or drawer. */
    level?: 1 | 2;
    /** Centers the title and subtitle, for headings on their own such as a welcome screen. */
    centered?: boolean;
  }>(),
  {
    level: 1,
  },
);
</script>

<template>
  <div :class="{ 'text-center': props.centered }">
    <div :class="['d-flex ga-4 align-center', { 'justify-center': props.centered }]">
      <slot name="prepend" />
      <component :is="`h${props.level}`">{{ props.title }}</component>
      <slot name="append" />
    </div>
    <p class="text-body-medium text-medium-emphasis" v-if="props.subtitle || $slots.subtitle">
      <slot name="subtitle">{{ props.subtitle }}</slot>
    </p>
  </div>
</template>
