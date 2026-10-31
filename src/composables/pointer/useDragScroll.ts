import type { Ref } from 'vue';
import { ref } from 'vue';

import { useScrollMomentum } from './useScrollMomentum';

/** How far the pointer may move before the press counts as a drag instead of a click. */
const DEFAULT_DRAG_THRESHOLD = 6;

/** How much of the pointer movement past an edge turns into overscroll. */
const OVERSCROLL_FRICTION = 0.4;

/** How much each new pointer sample moves the tracked velocity, to smooth out jitter. */
const VELOCITY_SMOOTHING = 0.2;

/** How old, in ms, the last pointer sample may be at release for its velocity to still start a glide. */
const VELOCITY_MAX_AGE = 50;

/**
 * Lets a horizontally overflowing element be scrolled by dragging it, with a glide after release
 * and a rubber-band overscroll at the edges. The click that ends a drag is swallowed.
 * @param element - The scrollable element.
 * @param dragThreshold - How far in px the pointer must move before the press becomes a drag.
 * @returns Whether a drag is in progress, the overscroll to render as a translation, and event handlers to bind with `v-on`.
 */
export const useDragScroll = (
  element: Readonly<Ref<HTMLElement | null>>,
  dragThreshold: number = DEFAULT_DRAG_THRESHOLD,
) => {
  const isDragging = ref<boolean>(false);
  const overscrollOffset = ref<number>(0);

  let activePointerId: number | null = null;
  let lastPointerX = 0;
  let lastPointerTime = 0;
  let velocity = 0;
  let suppressClick = false;

  const momentum = useScrollMomentum(element);

  /**
   * Ends the active drag and lets the element glide on, when allowed and the release was recent enough.
   * @param timestamp - The timestamp of the event that ends the drag.
   * @param allowMomentum - False when the drag was interrupted rather than released.
   */
  const endDrag = (timestamp: number, allowMomentum: boolean): void => {
    if (activePointerId === null) {
      return;
    }

    if (element.value?.hasPointerCapture(activePointerId)) {
      element.value.releasePointerCapture(activePointerId);
    }

    const wasDragging = isDragging.value;
    const isVelocityFresh = timestamp - lastPointerTime <= VELOCITY_MAX_AGE;

    activePointerId = null;
    isDragging.value = false;
    overscrollOffset.value = 0;

    if (!allowMomentum) {
      suppressClick = false;
    }

    if (allowMomentum && wasDragging && isVelocityFresh) {
      momentum.start(velocity);
    }

    velocity = 0;
  };

  /**
   * Moves the overscroll for a pointer movement at an edge. Pulling further out meets friction,
   * pulling back moves 1:1, and the overscroll snaps to zero instead of crossing to the other side.
   * @param moveDelta - The horizontal pointer movement since the last sample.
   */
  const applyOverscroll = (moveDelta: number): void => {
    const offset = overscrollOffset.value;
    const isPullingBack = (offset > 0 && moveDelta > 0) || (offset < 0 && moveDelta < 0);
    const nextOffset = offset - moveDelta * (isPullingBack ? 1 : OVERSCROLL_FRICTION);
    const hasCrossedZero = offset !== 0 && Math.sign(nextOffset) !== Math.sign(offset);

    overscrollOffset.value = hasCrossedZero ? 0 : nextOffset;
  };

  /**
   * Blends a pointer sample into the tracked scroll velocity.
   * @param moveDelta - The horizontal pointer movement since the last sample.
   * @param deltaTime - The time since the last sample in ms.
   */
  const trackVelocity = (moveDelta: number, deltaTime: number): void => {
    if (deltaTime <= 0) {
      return;
    }

    const sampleVelocity = -moveDelta / deltaTime;
    velocity = velocity === 0 ? sampleVelocity : velocity + (sampleVelocity - velocity) * VELOCITY_SMOOTHING;
  };

  /**
   * Starts tracking a possible drag and stops any running glide.
   * @param event - The pointerdown event.
   */
  const onPointerdown = (event: PointerEvent): void => {
    if (event.button !== 0 || activePointerId !== null || !element.value) {
      return;
    }

    momentum.stop();

    activePointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerTime = event.timeStamp;
    velocity = 0;
    isDragging.value = false;
    suppressClick = false;
  };

  /**
   * Scrolls, or overscrolls at an edge, with the pointer once it has moved past the drag threshold.
   * @param event - The pointermove event.
   */
  const onPointermove = (event: PointerEvent): void => {
    const el = element.value;

    if (!el || activePointerId !== event.pointerId) {
      return;
    }

    /** The release can land outside the element, e.g. on a drawer opened by a long press, so end the drag here. */
    if ((event.buttons & 1) === 0) {
      endDrag(event.timeStamp, false);
      return;
    }

    const moveDelta = event.clientX - lastPointerX;

    if (!isDragging.value && Math.abs(moveDelta) <= dragThreshold) {
      return;
    }

    if (!isDragging.value) {
      isDragging.value = true;
      suppressClick = true;
      el.setPointerCapture(event.pointerId);
    }

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const isAtEdge = (el.scrollLeft <= 0 && moveDelta > 0) || (el.scrollLeft >= maxScrollLeft && moveDelta < 0);

    if (overscrollOffset.value !== 0 || isAtEdge) {
      applyOverscroll(moveDelta);
    } else {
      el.scrollLeft -= moveDelta;
    }

    trackVelocity(moveDelta, event.timeStamp - lastPointerTime);

    lastPointerX = event.clientX;
    lastPointerTime = event.timeStamp;
  };

  /**
   * Ends the drag on release.
   * @param event - The pointerup event.
   */
  const onPointerup = (event: PointerEvent): void => {
    if (activePointerId === event.pointerId) {
      endDrag(event.timeStamp, true);
    }
  };

  /**
   * Ends the drag without a glide when the browser takes the pointer away.
   * @param event - The pointercancel event.
   */
  const onPointercancel = (event: PointerEvent): void => {
    if (activePointerId === event.pointerId) {
      endDrag(event.timeStamp, false);
    }
  };

  /**
   * Swallows the click that ends a drag, so dragging over a card does not activate it.
   * @param event - The click event, handled in the capture phase.
   */
  const onClickCapture = (event: MouseEvent): void => {
    if (!suppressClick) {
      return;
    }

    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    handlers: {
      clickCapture: onClickCapture,
      pointercancel: onPointercancel,
      pointerdown: onPointerdown,
      pointermove: onPointermove,
      pointerup: onPointerup,
    },
    isDragging,
    overscrollOffset,
  };
};
