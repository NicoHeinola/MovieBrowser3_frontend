import type * as Vue from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useScrollMomentum } from '../useScrollMomentum';

vi.mock('vue', async (importOriginal) => ({
  ...(await importOriginal<typeof Vue>()),
  onBeforeUnmount: vi.fn(),
}));

let frames: FrameRequestCallback[] = [];

/**
 * Runs the queued animation frames at the given timestamps.
 * @param timestamps - One timestamp per frame to run.
 */
const runFrames = (...timestamps: number[]): void => {
  for (const timestamp of timestamps) {
    const queued = frames;
    frames = [];
    for (const frame of queued) frame(timestamp);
  }
};

const createElement = (scrollLeft = 0) =>
  ref({ clientWidth: 100, scrollLeft, scrollWidth: 1000 } as unknown as HTMLElement);

describe('useScrollMomentum', () => {
  beforeEach(() => {
    frames = [];
    vi.stubGlobal('requestAnimationFrame', (frame: FrameRequestCallback) => frames.push(frame));
    vi.stubGlobal('cancelAnimationFrame', () => {
      frames = [];
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('glides in the velocity direction and slows down', () => {
    const element = createElement(100);
    const { start } = useScrollMomentum(element);

    start(1);
    runFrames(0, 16, 32);

    const firstStep = 116 - 100;
    const secondStep = element.value.scrollLeft - 116;

    expect(element.value.scrollLeft).toBeGreaterThan(116);
    expect(secondStep).toBeLessThan(firstStep);
  });

  it('ignores a release that is too slow', () => {
    const element = createElement(100);
    const { start } = useScrollMomentum(element);

    start(0.05);

    expect(frames).toHaveLength(0);
  });

  it('stops at the edge', () => {
    const element = createElement(890);
    const { start } = useScrollMomentum(element);

    start(1);
    runFrames(0, 16);

    expect(element.value.scrollLeft).toBe(900);
    expect(frames).toHaveLength(0);
  });

  it('stops on demand', () => {
    const element = createElement(100);
    const { start, stop } = useScrollMomentum(element);

    start(1);
    runFrames(0);
    stop();
    runFrames(16);

    expect(element.value.scrollLeft).toBe(100);
  });
});
