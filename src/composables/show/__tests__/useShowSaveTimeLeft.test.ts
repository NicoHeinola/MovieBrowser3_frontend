import type { ShowSaveWork } from '../useShowSaveTimeLeft';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useShowSaveTimeLeft } from '../useShowSaveTimeLeft';

/**
 * Starts the estimate for a save of 4 files of 100 bytes, with the first one uploading.
 * @returns The work to move, and the estimate.
 */
const setup = () => {
  const work = ref<ShowSaveWork | null>({ done: 0, total: 400, current: 100 });
  const { secondsLeft } = useShowSaveTimeLeft(() => work.value);
  return { work, secondsLeft };
};

describe('useShowSaveTimeLeft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('has no estimate until the first file finishes', () => {
    const { secondsLeft } = setup();

    vi.advanceTimersByTime(10_000);
    expect(secondsLeft.value).toBeNull();
  });

  it('counts down every second while the running upload keeps the pace', async () => {
    const { work, secondsLeft } = setup();

    // One file in 10 seconds leaves 30 more.
    vi.advanceTimersByTime(10_000);
    work.value = { done: 100, total: 400, current: 100 };
    await nextTick();
    expect(secondsLeft.value).toBe(30);

    vi.advanceTimersByTime(1000);
    expect(secondsLeft.value).toBe(29);
    vi.advanceTimersByTime(4000);
    expect(secondsLeft.value).toBe(25);
  });

  it('raises the estimate again while an upload runs past its expected time', async () => {
    const { work, secondsLeft } = setup();

    vi.advanceTimersByTime(10_000);
    work.value = { done: 100, total: 400, current: 100 };
    await nextTick();

    // The second file is assumed at most 90% done, so the pace over the save drops as it keeps going.
    vi.advanceTimersByTime(9000);
    expect(secondsLeft.value).toBe(21);
    vi.advanceTimersByTime(11_000);
    const later = secondsLeft.value;
    expect(later).toBeGreaterThan(21);
    vi.advanceTimersByTime(10_000);
    expect(secondsLeft.value).toBeGreaterThan(later!);
  });

  it('re-estimates from the new pace when the next file finishes, and forgets the save when it ends', async () => {
    const { work, secondsLeft } = setup();

    vi.advanceTimersByTime(10_000);
    work.value = { done: 100, total: 400, current: 100 };
    await nextTick();

    // Two files in 40 seconds leave 40 more.
    vi.advanceTimersByTime(30_000);
    work.value = { done: 200, total: 400, current: 100 };
    await nextTick();
    expect(secondsLeft.value).toBe(40);

    work.value = null;
    await nextTick();
    expect(secondsLeft.value).toBeNull();
  });
});
