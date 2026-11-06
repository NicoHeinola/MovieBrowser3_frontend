<script setup lang="ts">
import { makeSortableItem } from '@vue-dnd-kit/core';
import { useTemplateRef } from 'vue';

const props = defineProps<{
  /** The list item this row renders. Its key comes from the owning `useSortableItems`. */
  item: unknown;
}>();

const el = useTemplateRef<HTMLElement>('el');

const { isDragging } = makeSortableItem(el, {
  item: () => props.item,
  handle: '.handle',
});
</script>

<template>
  <div :style="{ opacity: isDragging ? 0 : 1 }" tabindex="-1" @keydown.stop @keyup.stop ref="el">
    <slot />
  </div>
</template>
