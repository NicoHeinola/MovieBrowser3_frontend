import type { Ref } from 'vue';
import { onBeforeUnmount } from 'vue';

/** How much of the velocity survives each 60 fps frame. */
const DECAY_PER_FRAME = 0.92;

/** The duration of one 60 fps frame in milliseconds, which the decay is defined against. */
const FRAME_DURATION = 16.67;

/** The velocity in px/ms below which the glide stops. */
const MIN_VELOCITY = 0.02;

/** The velocity in px/ms a release needs to start a glide at all. */
const START_VELOCITY = 0.08;

/**
 * Keeps a horizontally scrolling element gliding after a drag, slowing down until it stops or hits an edge.
 * @param element - The scrollable element.
 * @returns Functions that start and stop the glide.
 */
export const useScrollMomentum = (element: Readonly<Ref<HTMLElement | null>>) => {
  let frameId: number | null = null;
  let lastTimestamp: number | null = null;
  let velocity = 0;

  /** Stops the glide. */
  const stop = (): void => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    lastTimestamp = null;
    velocity = 0;
  };

  /**
   * Advances the glide by one animation frame.
   * @param timestamp - The frame timestamp from `requestAnimationFrame`.
   */
  const step = (timestamp: number): void => {
    const el = element.value;

    if (!el) {
      stop();
      return;
    }

    /** The first frame only records its timestamp, since there is no elapsed time to move by yet. */
    if (lastTimestamp === null || timestamp <= lastTimestamp) {
      lastTimestamp ??= timestamp;
      frameId = requestAnimationFrame(step);
      return;
    }

    const deltaTime = timestamp - lastTimestamp;

    lastTimestamp = timestamp;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    if (maxScrollLeft <= 0) {
      stop();
      return;
    }

    const nextScrollLeft = el.scrollLeft + velocity * deltaTime;
    const clampedScrollLeft = Math.min(maxScrollLeft, Math.max(0, nextScrollLeft));

    el.scrollLeft = clampedScrollLeft;
    velocity *= Math.pow(DECAY_PER_FRAME, deltaTime / FRAME_DURATION);

    if (Math.abs(velocity) < MIN_VELOCITY || clampedScrollLeft !== nextScrollLeft) {
      stop();
      return;
    }

    frameId = requestAnimationFrame(step);
  };

  /**
   * Starts a glide, unless the release was too slow to deserve one.
   * @param initialVelocity - The scroll velocity at release, in px/ms. Positive scrolls right.
   */
  const start = (initialVelocity: number): void => {
    stop();

    if (Math.abs(initialVelocity) < START_VELOCITY) {
      return;
    }

    velocity = initialVelocity;
    frameId = requestAnimationFrame(step);
  };

  onBeforeUnmount(stop);

  return {
    start,
    stop,
  };
};
