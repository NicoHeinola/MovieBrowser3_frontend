<script setup lang="ts">
import { ref } from 'vue';

import { useDragScroll } from '@/composables/pointer/useDragScroll';

const props = defineProps<{
  dragThreshold?: number;
}>();

const containerEl = ref<HTMLDivElement | null>(null);

const { handlers, isDragging, overscrollOffset } = useDragScroll(containerEl, props.dragThreshold);

defineExpose({
  /** The scrolling element, for callers that track or drive its scroll position. */
  el: containerEl,
});
</script>

<template>
  <div
    :class="['drag-scroll-container', { 'is-dragging': isDragging }]"
    :style="{ transform: `translateX(${-overscrollOffset}px)` }"
    v-on="handlers"
    ref="containerEl"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.drag-scroll-container {
  scrollbar-width: none;
  touch-action: pan-y;
  transition: transform 0.2s ease;
  user-select: none;

  &.is-dragging {
    transition: none;
  }
}
</style>
