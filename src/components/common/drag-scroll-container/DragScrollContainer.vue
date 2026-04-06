<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    dragThreshold?: number;
  }>(),
  {
    dragThreshold: 6,
  },
);

const containerEl = ref<HTMLDivElement | null>(null);
const activePointerId = ref<number | null>(null);
const dragStartX = ref(0);
const dragStartScrollLeft = ref(0);
const hasPointerDown = ref(false);
const isDragging = ref(false);
const suppressClick = ref(false);

const handlePointerDown = (event: PointerEvent) => {
  if (event.button !== 0) {
    return;
  }

  const element = containerEl.value;

  if (!element) {
    return;
  }

  activePointerId.value = event.pointerId;
  dragStartX.value = event.clientX;
  dragStartScrollLeft.value = element.scrollLeft;
  hasPointerDown.value = true;
  isDragging.value = false;
  suppressClick.value = false;
};

const handlePointerMove = (event: PointerEvent) => {
  const element = containerEl.value;

  if (!element || activePointerId.value !== event.pointerId || !hasPointerDown.value) {
    return;
  }

  const deltaX = event.clientX - dragStartX.value;

  if (!isDragging.value && Math.abs(deltaX) <= props.dragThreshold) {
    return;
  }

  if (!isDragging.value) {
    isDragging.value = true;
    suppressClick.value = true;
    element.setPointerCapture(event.pointerId);
  }

  element.scrollLeft = dragStartScrollLeft.value - deltaX;
};

const endDrag = (pointerId: number) => {
  const element = containerEl.value;

  if (activePointerId.value !== pointerId) {
    return;
  }

  if (element?.hasPointerCapture(pointerId)) {
    element.releasePointerCapture(pointerId);
  }

  activePointerId.value = null;
  hasPointerDown.value = false;
  isDragging.value = false;
};

const handlePointerUp = (event: PointerEvent) => {
  endDrag(event.pointerId);
};

const handlePointerCancel = (event: PointerEvent) => {
  endDrag(event.pointerId);
};

const handleClickCapture = (event: MouseEvent) => {
  if (!suppressClick.value) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  suppressClick.value = false;
};
</script>

<template>
  <div
    class="drag-scroll-container"
    @click.capture="handleClickCapture"
    @pointercancel="handlePointerCancel"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    ref="containerEl"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.drag-scroll-container {
  scrollbar-width: none;
  user-select: none;
}
</style>
