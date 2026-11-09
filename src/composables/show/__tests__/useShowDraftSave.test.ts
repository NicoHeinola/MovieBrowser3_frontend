import type { Show } from '@/interfaces/api/models/Show';
import type { UnwrapRef } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { showEntryService } from '@/services/show/showEntryService';
import { showEpisodeService } from '@/services/show/showEpisodeService';
import { showLinkService } from '@/services/show/showLinkService';
import { deepClone } from '@/utils/clone/deepClone';
import { useShowDraftSave } from '../useShowDraftSave';

vi.mock('@/services/show/showService', () => ({ showService: { create: vi.fn(), update: vi.fn() } }));
vi.mock('@/services/show/showTitleService', () => ({
  showTitleService: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showEntryService', () => ({
  showEntryService: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showEpisodeService', () => ({
  showEpisodeService: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showCategoryService', () => ({
  showCategoryService: { create: vi.fn(), remove: vi.fn() },
}));
vi.mock('@/services/show/showLinkService', () => ({
  showLinkService: { create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

/**
 * Builds a saved show with a season of two episodes and an empty movie entry.
 * @returns The show.
 */
const createShow = (): UnwrapRef<Show> =>
  ({
    id: 4,
    titles: [],
    categories: [],
    entries: [
      {
        id: 41,
        show_id: 4,
        type: ShowEntryType.Season,
        name: 'Season 1',
        sort_order: 0,
        episodes: [
          { id: 42, show_entry_id: 41, name: 'One', sequence_number: 0 },
          { id: 43, show_entry_id: 41, name: 'Movie', sequence_number: 1 },
        ],
      },
      { id: 44, show_id: 4, type: ShowEntryType.Movie, name: 'Movie', sort_order: 1, episodes: [] },
    ],
    outgoing_links: [],
    incoming_links: [],
  }) as unknown as UnwrapRef<Show>;

/**
 * Records the order of episode and entry requests.
 * @returns The list the requests are written to.
 */
const recordCalls = (): string[] => {
  const calls: string[] = [];

  vi.mocked(showEpisodeService.create).mockImplementation(async (entryId) => {
    calls.push(`create episode in ${entryId}`);
    return { id: 60 } as never;
  });
  vi.mocked(showEpisodeService.update).mockImplementation(async (id, request) => {
    calls.push(`update episode ${id} in ${request.show_entry_id}`);
    return {} as never;
  });
  vi.mocked(showEpisodeService.remove).mockImplementation(async (id) => {
    calls.push(`remove episode ${id}`);
  });
  vi.mocked(showEntryService.create).mockResolvedValue({ id: 50 } as never);
  vi.mocked(showEntryService.remove).mockImplementation(async (id) => {
    calls.push(`remove entry ${id}`);
  });

  return calls;
};

describe('useShowDraftSave', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('moves an episode to another entry instead of deleting it, even when its old entry goes', async () => {
    const calls = recordCalls();
    const savedShow = createShow();
    const draft = deepClone(savedShow);

    // The movie leaves Season 1 for a new entry of its own, and Season 1 goes away.
    const movedEpisode = draft.entries![0]!.episodes![1]!;
    const movie = { name: 'Movie', type: ShowEntryType.Movie, sort_order: 0, episodes: [movedEpisode] };
    draft.entries = [movie as never];
    await useShowDraftSave().save(draft, savedShow);

    expect(calls).toEqual(['update episode 43 in 50', 'remove entry 41', 'remove entry 44']);
  });

  it('uploads every new episode before deleting any, as a file added again can be one a delete removes', async () => {
    const calls = recordCalls();
    const savedShow = createShow();
    const draft = deepClone(savedShow);

    // The user removes the movie from Season 1 and adds its file to the movie entry as a new episode.
    const [season, movie] = draft.entries!;
    season!.episodes = [season!.episodes![0]!];
    movie!.episodes = [{ name: 'Movie', sequence_number: 0 } as never];
    await useShowDraftSave().save(draft, savedShow);

    expect(calls).toEqual(['create episode in 44', 'remove episode 43']);
  });

  it('moves an episode back after a failed save, as the first save already moved it', async () => {
    const calls = recordCalls();
    vi.mocked(showLinkService.create)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue({ id: 70 } as never);
    const savedShow = createShow();
    const draft = deepClone(savedShow);
    draft.outgoing_links = [{ target_show_id: 7 } as never];

    // Move the movie to its entry; the save fails after the move went through.
    const [season, movieEntry] = draft.entries!;
    const movedEpisode = season!.episodes!.pop()!;
    movieEntry!.episodes = [{ ...movedEpisode, sequence_number: 0 }];
    await expect(useShowDraftSave().save(draft, savedShow)).rejects.toThrow('fail');

    // The user moves it back to where it was and saves again.
    movieEntry!.episodes = [];
    season!.episodes!.push({ ...movedEpisode, sequence_number: 1 });
    await useShowDraftSave().save(draft, savedShow);

    expect(calls).toEqual(['update episode 43 in 44', 'update episode 43 in 41']);
  });

  it('counts episode progress while it saves, and clears it afterwards', async () => {
    recordCalls();
    const { episodeProgress, save } = useShowDraftSave();
    const progress: unknown[] = [];
    // Each request sees the progress of the ones before it.
    vi.mocked(showEpisodeService.update).mockImplementation(async () => {
      progress.push(episodeProgress.value);
      return {} as never;
    });
    vi.mocked(showEpisodeService.remove).mockImplementation(async () => {
      progress.push(episodeProgress.value);
    });
    const savedShow = createShow();
    const draft = deepClone(savedShow);

    draft.entries![0]!.episodes![0]!.name = 'One, renamed';
    draft.entries![0]!.episodes!.pop();
    await save(draft, savedShow);

    expect(progress).toEqual([
      { done: 0, total: 2 },
      { done: 1, total: 2 },
    ]);
    expect(episodeProgress.value).toBeNull();
  });
});
