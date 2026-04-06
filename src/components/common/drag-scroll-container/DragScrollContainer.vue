<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    dragThreshold?: number;
  }>(),
  {
    dragThreshold: 6,
  },
);

const containerEl = ref<HTMLDivElement | null>(null);

const MOMENTUM_DECAY_PER_FRAME = 0.92;
const MOMENTUM_MIN_VELOCITY = 0.02;
const MOMENTUM_START_VELOCITY = 0.08;
const VELOCITY_SMOOTHING = 0.2;

let activePointerId: number | null = null;
let dragStartX = 0;
let dragStartScrollLeft = 0;
let lastPointerX = 0;
let lastPointerTime = 0;
let dragVelocity = 0;
let isDragging = false;
let suppressClick = false;
let momentumFrameId: number | null = null;
let momentumTimestamp = 0;

const stopMomentum = () => {
  if (momentumFrameId !== null) {
    cancelAnimationFrame(momentumFrameId);
    momentumFrameId = null;
  }

  momentumTimestamp = 0;
  dragVelocity = 0;
  suppressClick = false;
};

const scheduleMomentum = () => {
  momentumFrameId = requestAnimationFrame(runMomentum);
};

// Decay the release velocity over time so the rail glides and then settles.
const runMomentum = (timestamp: number) => {
  const element = containerEl.value;

  if (!element) {
    stopMomentum();
    return;
  }

  // The first frame only establishes a clean time baseline after release.
  if (momentumTimestamp === 0) {
    momentumTimestamp = timestamp;
    scheduleMomentum();
    return;
  }

  const deltaTime = timestamp - momentumTimestamp;

  // Ignore invalid frame timing so one bad tick does not distort the glide distance.
  if (deltaTime <= 0) {
    scheduleMomentum();
    return;
  }

  momentumTimestamp = timestamp;

  const maxScrollLeft = element.scrollWidth - element.clientWidth;

  if (maxScrollLeft <= 0) {
    stopMomentum();
    return;
  }

  const nextScrollLeft = element.scrollLeft + dragVelocity * deltaTime;
  const clampedScrollLeft = Math.min(maxScrollLeft, Math.max(0, nextScrollLeft));

  element.scrollLeft = clampedScrollLeft;

  const decay = Math.pow(MOMENTUM_DECAY_PER_FRAME, deltaTime / 16.67);

  dragVelocity *= decay;

  if (Math.abs(dragVelocity) < MOMENTUM_MIN_VELOCITY || clampedScrollLeft !== nextScrollLeft) {
    stopMomentum();
    return;
  }

  scheduleMomentum();
};

const startMomentum = () => {
  if (Math.abs(dragVelocity) < MOMENTUM_START_VELOCITY) {
    return;
  }

  // Reset the frame baseline so momentum starts from the release moment.
  momentumTimestamp = 0;
  scheduleMomentum();
};

const endDrag = () => {
  const element = containerEl.value;
  const pointerId = activePointerId;

  if (pointerId === null) {
    return;
  }

  if (element?.hasPointerCapture(pointerId)) {
    element.releasePointerCapture(pointerId);
  }

  activePointerId = null;
  isDragging = false;
  lastPointerTime = 0;
  lastPointerX = 0;

  if (!suppressClick) {
    dragVelocity = 0;
    return;
  }

  startMomentum();
};

const handlePointerDown = (event: PointerEvent) => {
  if (event.button !== 0 || activePointerId !== null) {
    return;
  }

  const element = containerEl.value;

  if (!element) {
    return;
  }

  stopMomentum();

  activePointerId = event.pointerId;
  dragStartX = event.clientX;
  dragStartScrollLeft = element.scrollLeft;
  lastPointerX = event.clientX;
  lastPointerTime = event.timeStamp;
  isDragging = false;
  suppressClick = false;
};

const handlePointerMove = (event: PointerEvent) => {
  const element = containerEl.value;

  if (!element || activePointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - dragStartX;

  if (!isDragging && Math.abs(deltaX) <= props.dragThreshold) {
    lastPointerX = event.clientX;
    lastPointerTime = event.timeStamp;
    return;
  }

  if (!isDragging) {
    isDragging = true;
    suppressClick = true;
    element.setPointerCapture(event.pointerId);
  }

  element.scrollLeft = dragStartScrollLeft - deltaX;

  const deltaTime = event.timeStamp - lastPointerTime;

  if (deltaTime > 0) {
    // Smooth pointer samples a bit so one noisy move event does not spike momentum.
    const nextVelocity = -(event.clientX - lastPointerX) / deltaTime;

    dragVelocity =
      dragVelocity === 0 ? nextVelocity : dragVelocity + (nextVelocity - dragVelocity) * VELOCITY_SMOOTHING;
  }

  lastPointerX = event.clientX;
  lastPointerTime = event.timeStamp;
};

const handlePointerUp = (event: PointerEvent) => {
  if (activePointerId !== event.pointerId) {
    return;
  }

  endDrag();
};

const handlePointerCancel = (event: PointerEvent) => {
  if (activePointerId !== event.pointerId) {
    return;
  }

  suppressClick = false;
  endDrag();
};

const handleClickCapture = (event: MouseEvent) => {
  if (!suppressClick) {
    return;
  }

  // Keep clicks blocked until drag momentum fully stops.
  event.preventDefault();
  event.stopPropagation();

  if (momentumFrameId === null) {
    suppressClick = false;
  }
};

onBeforeUnmount(() => {
  stopMomentum();
});
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
