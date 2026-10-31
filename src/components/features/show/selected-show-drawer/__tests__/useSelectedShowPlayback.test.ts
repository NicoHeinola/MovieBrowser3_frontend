import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { useSelectedShowPlayback } from '../useSelectedShowPlayback';

const isStartingPlayback = ref<boolean>(false);
const playEpisode = vi.fn();
const playShow = vi.fn();

vi.mock('@/composables/show/useShowPlayback', () => ({
  useShowPlayback: () => ({ isStartingPlayback, playEpisode, playShow }),
}));

const createEpisode = (id: number) => ({ id, show_entry_id: 10, name: '', filename: '', sequence_number: 0 });

const entry: ShowEntry = {
  id: 10,
  show_id: 1,
  type: ShowEntryType.Season,
  name: 'Season 1',
  sort_order: 0,
  episodes: [createEpisode(100), createEpisode(101)],
};

const createProgress = (showId: number, episodeId: number): ShowWatchProgress => ({
  show_id: showId,
  show_entry_id: 10,
  episode_id: episodeId,
  updated_at: '2026-10-31',
});

const createShow = (watchProgress: ShowWatchProgress | null = null): Show => ({
  id: 1,
  banner_url: '',
  card_image_url: '',
  preview_url: null,
  description: '',
  titles: [],
  entries: [entry],
  watch_progress: watchProgress,
});

/**
 * Creates a promise that the test resolves by hand.
 * @returns The promise and its resolve function.
 */
const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve };
};

describe('useSelectedShowPlayback', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    isStartingPlayback.value = false;
  });

  it('starts from the first episode until the show has progress', () => {
    const show = ref<Show | null>(createShow());
    const { isContinuing, resumeEpisode } = useSelectedShowPlayback(show, ref(null));

    expect(resumeEpisode.value?.id).toBe(100);
    expect(isContinuing.value).toBe(false);

    show.value = createShow(createProgress(1, 101));

    expect(resumeEpisode.value?.id).toBe(101);
    expect(isContinuing.value).toBe(true);
  });

  it('marks only the clicked button as loading', async () => {
    const deferred = createDeferred<ShowWatchProgress | null>();
    playEpisode.mockReturnValue(deferred.promise);

    const show = ref<Show | null>(createShow());
    const { isStartingTarget, startingEpisodeId, watchEpisode } = useSelectedShowPlayback(show, ref(null));

    const pending = watchEpisode(createEpisode(101));

    expect(startingEpisodeId.value).toBe(101);
    expect(isStartingTarget.value).toBe(false);

    deferred.resolve(createProgress(1, 101));
    await pending;

    expect(startingEpisodeId.value).toBeNull();
  });

  it('continues the selected entry from the main button', async () => {
    playShow.mockResolvedValue(createProgress(1, 100));

    const show = ref<Show | null>(createShow());
    const { isStartingTarget, watchTarget } = useSelectedShowPlayback(show, ref(entry));

    const pending = watchTarget();
    expect(isStartingTarget.value).toBe(true);
    await pending;

    expect(playShow).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), entry);
    expect(isStartingTarget.value).toBe(false);
  });

  it('ignores clicks while another playback is starting', async () => {
    isStartingPlayback.value = true;

    const { watchEpisode, watchTarget } = useSelectedShowPlayback(ref(createShow()), ref(null));
    await watchEpisode(createEpisode(100));
    await watchTarget();

    expect(playEpisode).not.toHaveBeenCalled();
    expect(playShow).not.toHaveBeenCalled();
  });
});
