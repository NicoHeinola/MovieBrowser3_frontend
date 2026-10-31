<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle?: string;
  truncate?: boolean;
}>();
</script>

<template>
  <div :class="{ 'text-truncate': props.truncate }" :title="props.truncate ? props.title : undefined">
    <p :class="{ 'text-truncate': props.truncate }" class="text-label-medium text-medium-emphasis text-uppercase">
      {{ props.title }}
    </p>
    <p
      :class="{ 'text-truncate': props.truncate }"
      class="text-body-small text-medium-emphasis"
      v-if="props.subtitle || $slots.subtitle"
    >
      <slot name="subtitle">{{ props.subtitle }}</slot>
    </p>
  </div>
</template>
