import type { Show } from '@/interfaces/api/models/Show';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';

import { useHomeBanner } from '../useHomeBanner';

const BANNER_SHOW_HOLD_MS = 10_000;
const BANNER_ROTATION_MS = 15_000;

const show = { id: 1, banner_url: 'show.jpg' } as Show;

/**
 * Runs the composable in a scope the test can stop.
 * @param backgrounds - The default background urls.
 * @returns The composable's result, the drawer state and the scope.
 */
const setup = (backgrounds: string[] = ['a.jpg', 'b.jpg', 'c.jpg']) => {
  const scope = effectScope();
  const list = ref<string[]>(backgrounds);
  const isShowOpen = ref<boolean>(false);
  const banner = scope.run(() => useHomeBanner(list, isShowOpen))!;

  return { banner, isShowOpen, list, scope };
};

/**
 * Moves the fake clock forward, letting watchers run first.
 * @param ms - How far to advance.
 * @returns A promise that resolves once the clock has moved.
 */
const advance = async (ms: number): Promise<void> => {
  await nextTick();
  vi.advanceTimersByTime(ms);
  await nextTick();
};

describe('useHomeBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('clears the hovered show a while after the pointer leaves', async () => {
    const { banner } = setup();
    banner.isPointerOver.value = true;
    banner.selectedShow.value = show;
    await advance(BANNER_SHOW_HOLD_MS * 2);
    expect(banner.background.value).toBe('show.jpg');

    banner.isPointerOver.value = false;
    await advance(BANNER_SHOW_HOLD_MS - 1);
    expect(banner.selectedShow.value).toEqual(show);

    await advance(1);
    expect(banner.selectedShow.value).toBeNull();
    expect(banner.background.value).toBe('a.jpg');
  });

  it('cancels the countdown when the pointer comes back', async () => {
    const { banner } = setup();
    banner.selectedShow.value = show;
    await advance(BANNER_SHOW_HOLD_MS - 1);

    banner.isPointerOver.value = true;
    await advance(BANNER_SHOW_HOLD_MS);

    expect(banner.selectedShow.value).toEqual(show);
  });

  it('keeps the show while it is open and counts down after it closes', async () => {
    const { banner, isShowOpen } = setup();
    banner.selectedShow.value = show;
    isShowOpen.value = true;
    await advance(BANNER_SHOW_HOLD_MS * 2);
    expect(banner.selectedShow.value).toEqual(show);

    isShowOpen.value = false;
    await advance(BANNER_SHOW_HOLD_MS);

    expect(banner.selectedShow.value).toBeNull();
  });

  it('cycles through the backgrounds and wraps around', async () => {
    const { banner } = setup();
    expect(banner.background.value).toBe('a.jpg');

    await advance(BANNER_ROTATION_MS);
    expect(banner.background.value).toBe('b.jpg');

    await advance(BANNER_ROTATION_MS * 2);
    expect(banner.background.value).toBe('a.jpg');
  });

  it('stays on a single background', async () => {
    const { banner } = setup(['a.jpg']);

    await advance(BANNER_ROTATION_MS * 3);

    expect(banner.background.value).toBe('a.jpg');
  });

  it('has no background without any defaults', async () => {
    const { banner } = setup([]);

    await advance(BANNER_ROTATION_MS);

    expect(banner.background.value).toBeNull();
  });

  it('pauses the rotation while a show is on the banner', async () => {
    const { banner } = setup();
    banner.isPointerOver.value = true;
    banner.selectedShow.value = show;
    await advance(BANNER_ROTATION_MS * 2);

    banner.selectedShow.value = null;
    await nextTick();

    expect(banner.background.value).toBe('a.jpg');
  });

  it('falls back to the defaults for a show without a banner', async () => {
    const { banner } = setup();

    banner.selectedShow.value = { ...show, banner_url: null } as Show;

    expect(banner.background.value).toBe('a.jpg');
  });

  it('starts rotating once the backgrounds arrive', async () => {
    const { banner, list } = setup([]);

    list.value = ['a.jpg', 'b.jpg'];
    await advance(BANNER_ROTATION_MS);

    expect(banner.background.value).toBe('b.jpg');
  });

  it('stops its timers with the scope', async () => {
    const { banner, scope } = setup();
    await nextTick();

    scope.stop();
    await advance(BANNER_ROTATION_MS);

    expect(banner.background.value).toBe('a.jpg');
  });
});
