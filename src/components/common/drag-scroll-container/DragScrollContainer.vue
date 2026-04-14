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
const MOMENTUM_VELOCITY_MAX_AGE = 50;
const VELOCITY_SMOOTHING = 0.2;
const OVERSCROLL_FRICTION = 0.4;

let activePointerId: number | null = null;
let lastPointerX = 0;
let lastPointerTime = 0;
let dragVelocity = 0;
let isDragging = false;
let suppressClick = false;
let momentumFrameId: number | null = null;
let momentumTimestamp = 0;
const overscrollOffset = ref(0);

const stopMomentum = () => {
  if (momentumFrameId !== null) {
    cancelAnimationFrame(momentumFrameId);
    momentumFrameId = null;
  }

  momentumTimestamp = 0;
  dragVelocity = 0;
  suppressClick = false;
};

const runMomentum = (timestamp: number) => {
  const element = containerEl.value;

  if (!element) {
    stopMomentum();
    return;
  }

  if (momentumTimestamp === 0) {
    momentumTimestamp = timestamp;
    momentumFrameId = requestAnimationFrame(runMomentum);
    return;
  }

  const deltaTime = timestamp - momentumTimestamp;

  if (deltaTime <= 0) {
    momentumFrameId = requestAnimationFrame(runMomentum);
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
  dragVelocity *= Math.pow(MOMENTUM_DECAY_PER_FRAME, deltaTime / 16.67);

  if (Math.abs(dragVelocity) < MOMENTUM_MIN_VELOCITY || clampedScrollLeft !== nextScrollLeft) {
    stopMomentum();
    return;
  }

  momentumFrameId = requestAnimationFrame(runMomentum);
};

const endDrag = (timestamp: number) => {
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
  overscrollOffset.value = 0;

  const velocityAge = timestamp - lastPointerTime;

  lastPointerX = 0;
  lastPointerTime = 0;

  if (!suppressClick || velocityAge > MOMENTUM_VELOCITY_MAX_AGE) {
    dragVelocity = 0;
    return;
  }

  if (Math.abs(dragVelocity) >= MOMENTUM_START_VELOCITY) {
    momentumTimestamp = 0;
    momentumFrameId = requestAnimationFrame(runMomentum);
  }
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

  const moveDelta = event.clientX - lastPointerX;

  if (!isDragging && Math.abs(moveDelta) <= props.dragThreshold) {
    return;
  }

  if (!isDragging) {
    isDragging = true;
    suppressClick = true;
    element.setPointerCapture(event.pointerId);
  }

  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  const currentScrollLeft = element.scrollLeft;
  const atBoundary = (currentScrollLeft <= 0 && moveDelta > 0) || (currentScrollLeft >= maxScrollLeft && moveDelta < 0);

  if (overscrollOffset.value !== 0 || atBoundary) {
    const goingDeeper =
      overscrollOffset.value === 0 ||
      (moveDelta < 0 && overscrollOffset.value > 0) ||
      (moveDelta > 0 && overscrollOffset.value < 0);

    const friction = goingDeeper ? OVERSCROLL_FRICTION : 1;
    const newOverscroll = overscrollOffset.value - moveDelta * friction;
    const crossedZero =
      overscrollOffset.value !== 0 &&
      ((overscrollOffset.value > 0 && newOverscroll <= 0) || (overscrollOffset.value < 0 && newOverscroll >= 0));

    overscrollOffset.value = crossedZero ? 0 : newOverscroll;
  } else {
    element.scrollLeft -= moveDelta;
  }

  const deltaTime = event.timeStamp - lastPointerTime;

  if (deltaTime > 0) {
    const nextVelocity = -moveDelta / deltaTime;

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

  endDrag(event.timeStamp);
};

const handlePointerCancel = (event: PointerEvent) => {
  if (activePointerId !== event.pointerId) {
    return;
  }

  suppressClick = false;
  endDrag(event.timeStamp);
};

const handleClickCapture = (event: MouseEvent) => {
  if (!suppressClick) {
    return;
  }

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
    :class="['drag-scroll-container', { 'is-dragging': isDragging }]"
    :style="{ transform: `translateX(${-overscrollOffset}px)` }"
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
  touch-action: pan-y;
  transition: transform 0.2s ease;
  user-select: none;

  &.is-dragging {
    transition: none;
  }
}
</style>
