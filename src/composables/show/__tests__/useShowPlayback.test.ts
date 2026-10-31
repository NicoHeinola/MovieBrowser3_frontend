import type * as VueQuery from '@tanstack/vue-query';
import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { episodePlaybackService } from '@/services/show/episodePlaybackService';
import { useShowPlayback } from '../useShowPlayback';

const queryClient = new QueryClient();
const showAPIErrorSnackbar = vi.fn();
const showWarningSnackbar = vi.fn();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => queryClient,
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showWarningSnackbar }),
}));

vi.mock('@/services/show/episodePlaybackService', () => ({
  episodePlaybackService: {
    play: vi.fn(),
  },
}));

const createEpisode = (id: number) => ({ id, show_entry_id: 10, name: '', filename: '', sequence_number: 0 });

interface CachedShow {
  watch_progress: unknown;
}

const createShow = () => ({
  id: 1,
  entries: [{ id: 10, episodes: [createEpisode(100), createEpisode(101)] }],
  watch_progress: null,
});

const progress = { show_id: 1, show_entry_id: 10, episode_id: 101, updated_at: '2026-10-30' };

describe('useShowPlayback', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('plays an episode and patches every cached show list', async () => {
    queryClient.setQueryData([ShowQueryKey.HomeShows], { randomShows: [createShow()] });
    queryClient.setQueryData([ShowQueryKey.SearchShows, 'term', 1], { data: [createShow()] });
    vi.mocked(episodePlaybackService.play).mockResolvedValue(progress);

    const { playEpisode, isStartingPlayback } = useShowPlayback();

    await expect(playEpisode({ id: 101 })).resolves.toEqual(progress);
    expect(episodePlaybackService.play).toHaveBeenCalledWith(101);
    expect(isStartingPlayback.value).toBe(false);
    const homeShows = queryClient.getQueryData<{ randomShows: CachedShow[] }>([ShowQueryKey.HomeShows]);
    const searchShows = queryClient.getQueryData<{ data: CachedShow[] }>([ShowQueryKey.SearchShows, 'term', 1]);
    expect(homeShows?.randomShows[0]?.watch_progress).toEqual(progress);
    expect(searchShows?.data[0]?.watch_progress).toEqual(progress);
    expect(queryClient.getQueryState([ShowQueryKey.ContinueWatchingShows])).toBeUndefined();
  });

  it('refetches the continue watching list after playback', async () => {
    queryClient.setQueryData([ShowQueryKey.ContinueWatchingShows], []);
    vi.mocked(episodePlaybackService.play).mockResolvedValue(progress);

    const { playEpisode } = useShowPlayback();
    await playEpisode({ id: 101 });

    expect(queryClient.getQueryState([ShowQueryKey.ContinueWatchingShows])?.isInvalidated).toBe(true);
  });

  it('continues a show from its saved episode', async () => {
    vi.mocked(episodePlaybackService.play).mockResolvedValue(progress);

    const { playShow } = useShowPlayback();
    await playShow({ ...createShow(), watch_progress: progress });

    expect(episodePlaybackService.play).toHaveBeenCalledWith(101);
  });

  it('warns instead of playing when the show has no episodes', async () => {
    const { playShow } = useShowPlayback();

    await expect(playShow({ entries: [] })).resolves.toBeNull();
    expect(showWarningSnackbar).toHaveBeenCalled();
    expect(episodePlaybackService.play).not.toHaveBeenCalled();
  });

  it('shows the error and leaves the cache untouched when playback fails', async () => {
    const data = [createShow()];
    const error = new Error('fail');
    queryClient.setQueryData([ShowQueryKey.HomeShows], data);
    vi.mocked(episodePlaybackService.play).mockRejectedValue(error);

    const { playEpisode } = useShowPlayback();

    await expect(playEpisode({ id: 100 })).resolves.toBeNull();
    expect(showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(queryClient.getQueryData([ShowQueryKey.HomeShows])).toBe(data);
  });
});
