<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { ref } from 'vue';

import ShowCard from '@/components/features/show/show-card/ShowCard.vue';

const props = withDefaults(
  defineProps<{
    shows: Show[];
    cardWidth?: string | number;
    cardHeight?: string | number;
  }>(),
  {
    cardWidth: '300px',
    cardHeight: '200px',
  },
);

const emit = defineEmits<{
  (e: 'click:show', value: Show | null): void;
}>();

const selectedShow = defineModel<Show | null>('selectedShow');

const carouselEl = ref<HTMLDivElement | null>(null);
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

  const element = carouselEl.value;

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
  const element = carouselEl.value;

  if (!element || activePointerId.value !== event.pointerId || !hasPointerDown.value) {
    return;
  }

  const deltaX = event.clientX - dragStartX.value;

  if (!isDragging.value && Math.abs(deltaX) <= 6) {
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
  const element = carouselEl.value;

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

const onShowClick = (show: Show) => {
  selectedShow.value = show;

  emit('click:show', show);
};
</script>

<template>
  <div
    class="shows-container d-flex overflow-auto w-100"
    @click.capture="handleClickCapture"
    @pointercancel="handlePointerCancel"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    ref="carouselEl"
  >
    <show-card
      v-for="show in [...props.shows, props.shows[0]]"
      :height="cardHeight"
      :show="show"
      :width="cardWidth"
      class="rounded-0"
      @click.stop="onShowClick(show)"
      :key="show.id"
    />
  </div>
</template>

<style lang="scss" scoped>
.shows-container {
  scrollbar-width: none;
  user-select: none;
}
</style>
