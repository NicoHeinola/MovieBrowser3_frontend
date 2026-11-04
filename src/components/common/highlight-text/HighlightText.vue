<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Theme color of the words. */
    color?: string;
  }>(),
  {
    color: 'primary',
  },
);
</script>

<template>
  <span :class="`text-${props.color} font-weight-bold`"><slot /></span>
</template>
