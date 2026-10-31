<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div>
    <p class="text-label-medium text-medium-emphasis text-uppercase">{{ props.title }}</p>
    <p class="text-body-small text-medium-emphasis" v-if="props.subtitle || $slots.subtitle">
      <slot name="subtitle">{{ props.subtitle }}</slot>
    </p>
  </div>
</template>
