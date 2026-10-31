import type { Show } from '@/interfaces/api/models/Show';
import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import type { EffectScope, Ref } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope, reactive, ref } from 'vue';

import { useWatchProgressStream } from '@/composables/show/useWatchProgressStream';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { showService } from '@/services/show/showService';
import { watchProgressStreamService } from '@/services/show/watchProgressStreamService';
import { useSelectedShow } from '../useSelectedShow';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } });
const authStore = reactive<{ token: string | null }>({ token: null });

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/stores/auth/useAuthStore', () => ({
  useAuthStore: () => authStore,
}));

vi.mock('@/services/show/showService', () => ({
  showService: {
    get: vi.fn(),
  },
}));

vi.mock('@/services/show/watchProgressStreamService', () => ({
  watchProgressStreamService: {
    subscribe: vi.fn(),
  },
}));

const createProgress = (episodeId: number): ShowWatchProgress => ({
  show_id: 1,
  show_entry_id: 10,
  episode_id: episodeId,
  updated_at: `2026-10-31T12:00:0${episodeId % 10}.000000Z`,
});

const createShow = (id: number, watchProgress: ShowWatchProgress | null = null): Show => ({
  id,
  banner_url: '',
  card_image_url: '',
  preview_url: null,
  description: '',
  titles: [],
  entries: [{ id: 10, show_id: id, type: ShowEntryType.Season, name: 'Season 1', sort_order: 0 }],
  watch_progress: watchProgress,
});

const scopes: EffectScope[] = [];

/**
 * Runs the drawer's show query, and the app's watch progress stream, inside an app that provides the query client.
 * @param showId - The id of the shown show.
 * @param isShown - Whether the drawer is open.
 * @returns The selected show state.
 */
const useDrawerShow = (showId: Ref<number | null>, isShown: Ref<boolean>) => {
  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });

  const scope = effectScope();
  scopes.push(scope);

  return app.runWithContext(() =>
    scope.run(() => {
      useWatchProgressStream();
      return useSelectedShow(showId, isShown);
    }),
  )!;
};

describe('useSelectedShow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(watchProgressStreamService.subscribe).mockResolvedValue();
    authStore.token = null;
    queryClient.clear();
    queryClient.setQueryData([ShowQueryKey.HomeShows], { latestShows: [createShow(1, createProgress(100))] });
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('shows a show that a cached list holds without a request', async () => {
    const { show } = useDrawerShow(ref(1), ref(true));
    await flushPromises();

    expect(show.value?.id).toBe(1);
    expect(showService.get).not.toHaveBeenCalled();
  });

  it('refetches a show whose list is already stale', async () => {
    vi.mocked(showService.get).mockResolvedValue(createShow(1, createProgress(102)));
    const staleListTime = Date.now() - 120_000;
    queryClient.setQueryData([ShowQueryKey.HomeShows], { latestShows: [createShow(1)] }, { updatedAt: staleListTime });

    const { show } = useDrawerShow(ref(1), ref(true));
    await flushPromises();

    expect(showService.get).toHaveBeenCalledWith(1);
    expect(show.value?.watch_progress?.episode_id).toBe(102);
  });

  it('shows nothing without an id', () => {
    const { show } = useDrawerShow(ref(null), ref(true));

    expect(show.value).toBeNull();
  });

  it('never fetches while the drawer is closed', async () => {
    useDrawerShow(ref(2), ref(false));
    await flushPromises();

    expect(showService.get).not.toHaveBeenCalled();
  });

  it('keeps the previous show while a show no list holds is fetched', async () => {
    let resolve!: (show: Show) => void;
    vi.mocked(showService.get).mockReturnValue(new Promise<Show>((done) => (resolve = done)));
    const showId = ref<number | null>(1);
    const { isSwitchingShow, show } = useDrawerShow(showId, ref(true));

    showId.value = 2;
    await flushPromises();

    expect(showService.get).toHaveBeenCalledWith(2);
    expect(show.value?.id).toBe(1);
    expect(isSwitchingShow.value).toBe(true);

    resolve(createShow(2));
    await flushPromises();

    expect(show.value?.id).toBe(2);
    expect(isSwitchingShow.value).toBe(false);
  });

  it('returns to the previous show when a show fails to load', async () => {
    vi.mocked(showService.get).mockRejectedValue(new Error('fail'));
    const showId = ref<number | null>(1);
    const { show } = useDrawerShow(showId, ref(true));
    await flushPromises();

    showId.value = 2;
    await flushPromises();

    expect(showService.get).toHaveBeenCalledWith(2);
    expect(showId.value).toBe(1);
    expect(show.value?.id).toBe(1);
  });

  it('follows the media player advancing while the drawer is open', async () => {
    authStore.token = 'secret';
    const { show } = useDrawerShow(ref(1), ref(true));
    await flushPromises();

    vi.mocked(watchProgressStreamService.subscribe).mock.calls[0]?.[0].onWatchProgress(createProgress(101));

    expect(show.value?.watch_progress?.episode_id).toBe(101);
  });
});
