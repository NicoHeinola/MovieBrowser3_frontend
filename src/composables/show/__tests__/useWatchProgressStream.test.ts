import type { EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, reactive } from 'vue';

import { watchProgressStreamService } from '@/services/show/watchProgressStreamService';
import { useWatchProgressStream } from '../useWatchProgressStream';

const authStore = reactive<{ token: string | null }>({ token: null });
const applyWatchProgress = vi.fn();
const refetchShowLists = vi.fn();

vi.mock('@/stores/auth/useAuthStore', () => ({
  useAuthStore: () => authStore,
}));

vi.mock('@/composables/show/useShowWatchProgressCache', () => ({
  useShowWatchProgressCache: () => ({ applyWatchProgress, refetchShowLists }),
}));

vi.mock('@/services/show/watchProgressStreamService', () => ({
  watchProgressStreamService: {
    subscribe: vi.fn(),
  },
}));

type SubscribeOptions = Parameters<typeof watchProgressStreamService.subscribe>[0];

const getSubscription = (index = 0): SubscribeOptions =>
  vi.mocked(watchProgressStreamService.subscribe).mock.calls[index]?.[0] as SubscribeOptions;

const scopes: EffectScope[] = [];
let visibilityState: DocumentVisibilityState = 'visible';

Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibilityState });

/**
 * Switches the tab's visibility the way the browser does.
 * @param state - The new visibility.
 */
const setVisibility = async (state: DocumentVisibilityState): Promise<void> => {
  visibilityState = state;
  document.dispatchEvent(new Event('visibilitychange'));
  await nextTick();
};

/**
 * Lets fake time pass and the watchers it triggers run.
 * @param ms - The time to pass.
 */
const passTime = async (ms: number): Promise<void> => {
  vi.advanceTimersByTime(ms);
  await nextTick();
};

const startStream = (): EffectScope => {
  const scope = effectScope();
  scope.run(() => useWatchProgressStream());
  scopes.push(scope);
  return scope;
};

describe('useWatchProgressStream', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(watchProgressStreamService.subscribe).mockResolvedValue();
    authStore.token = null;
    visibilityState = 'visible';
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
    vi.useRealTimers();
  });

  it('opens no stream while logged out', () => {
    startStream();

    expect(watchProgressStreamService.subscribe).not.toHaveBeenCalled();
  });

  it('opens a stream for the logged in user and applies its progress', () => {
    authStore.token = 'secret';
    startStream();

    const subscription = getSubscription();
    expect(subscription.token).toBe('secret');
    expect(subscription.onWatchProgress).toBe(applyWatchProgress);
  });

  it('refetches the show lists on reconnect only', () => {
    authStore.token = 'secret';
    startStream();

    getSubscription().onOpen();
    expect(refetchShowLists).not.toHaveBeenCalled();

    getSubscription().onOpen();
    expect(refetchShowLists).toHaveBeenCalledTimes(1);
  });

  it('closes the stream on logout and reopens it on login', async () => {
    authStore.token = 'secret';
    startStream();
    const firstSignal = getSubscription().signal;
    getSubscription().onOpen();

    authStore.token = null;
    await nextTick();
    expect(firstSignal.aborted).toBe(true);

    authStore.token = 'other';
    await nextTick();
    expect(getSubscription(1).token).toBe('other');
    getSubscription(1).onOpen();
    expect(refetchShowLists).not.toHaveBeenCalled();
  });

  it('keeps the stream through a short tab switch', async () => {
    vi.useFakeTimers();
    authStore.token = 'secret';
    startStream();

    await setVisibility('hidden');
    await passTime(60_000);
    await setVisibility('visible');
    await passTime(10 * 60_000);

    expect(getSubscription().signal.aborted).toBe(false);
    expect(watchProgressStreamService.subscribe).toHaveBeenCalledTimes(1);
  });

  it('closes the stream while the tab stays hidden and refetches when it returns', async () => {
    vi.useFakeTimers();
    authStore.token = 'secret';
    startStream();
    getSubscription().onOpen();

    await setVisibility('hidden');
    await passTime(5 * 60_000);
    expect(getSubscription().signal.aborted).toBe(true);

    await setVisibility('visible');
    getSubscription(1).onOpen();
    expect(refetchShowLists).toHaveBeenCalledTimes(1);
  });

  it('closes the stream when its scope is disposed', () => {
    authStore.token = 'secret';
    const scope = startStream();

    scope.stop();

    expect(getSubscription().signal.aborted).toBe(true);
  });

  it('swallows a rejected token', async () => {
    vi.mocked(watchProgressStreamService.subscribe).mockRejectedValue(new Error('401'));
    authStore.token = 'secret';

    startStream();
    await nextTick();

    expect(watchProgressStreamService.subscribe).toHaveBeenCalledTimes(1);
  });
});
