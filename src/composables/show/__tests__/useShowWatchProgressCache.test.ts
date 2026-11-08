import type * as VueQuery from '@tanstack/vue-query';
import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { useShowWatchProgressCache } from '../useShowWatchProgressCache';

const queryClient = new QueryClient();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => queryClient,
}));

interface CachedShow {
  watch_progress: unknown;
}

const createShow = () => ({ id: 1, entries: [], watch_progress: null });

const progress = {
  show_id: 1,
  show_entry_id: 10,
  episode_id: 101,
  position_seconds: null,
  duration_seconds: null,
  updated_at: '2026-10-31',
};

describe('useShowWatchProgressCache', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('patches the progress onto every show query and refetches continue watching', () => {
    queryClient.setQueryData([ShowQueryKey.HomeShows], { randomShows: [createShow()] });
    queryClient.setQueryData([ShowQueryKey.SearchShows, 'term', 1], { data: [createShow()] });
    queryClient.setQueryData([ShowQueryKey.AdminShows], { data: [createShow()] });
    queryClient.setQueryData([ShowQueryKey.ContinueWatchingShows], [createShow()]);

    useShowWatchProgressCache().applyWatchProgress(progress);

    const homeShows = queryClient.getQueryData<{ randomShows: CachedShow[] }>([ShowQueryKey.HomeShows]);
    const searchShows = queryClient.getQueryData<{ data: CachedShow[] }>([ShowQueryKey.SearchShows, 'term', 1]);
    const adminShows = queryClient.getQueryData<{ data: CachedShow[] }>([ShowQueryKey.AdminShows]);
    const continueWatching = queryClient.getQueryData<CachedShow[]>([ShowQueryKey.ContinueWatchingShows]);
    expect(homeShows?.randomShows[0]?.watch_progress).toEqual(progress);
    expect(searchShows?.data[0]?.watch_progress).toEqual(progress);
    expect(adminShows?.data[0]?.watch_progress).toEqual(progress);
    expect(continueWatching?.[0]?.watch_progress).toEqual(progress);
    expect(queryClient.getQueryState([ShowQueryKey.HomeShows])?.isInvalidated).toBe(false);
    expect(queryClient.getQueryState([ShowQueryKey.ContinueWatchingShows])?.isInvalidated).toBe(true);
  });

  it('leaves continue watching alone when the show already leads it on the same episode', () => {
    queryClient.setQueryData([ShowQueryKey.ContinueWatchingShows], [{ ...createShow(), watch_progress: progress }]);

    // A position update while watching only moves the timestamp forward.
    const positionUpdate = { ...progress, position_seconds: 300, duration_seconds: 1440, updated_at: '2026-11-01' };
    useShowWatchProgressCache().applyWatchProgress(positionUpdate);

    const continueWatching = queryClient.getQueryData<CachedShow[]>([ShowQueryKey.ContinueWatchingShows]);
    expect(continueWatching?.[0]?.watch_progress).toEqual(positionUpdate);
    expect(queryClient.getQueryState([ShowQueryKey.ContinueWatchingShows])?.isInvalidated).toBe(false);
  });

  it('refetches continue watching when the show is not first yet', () => {
    queryClient.setQueryData(
      [ShowQueryKey.ContinueWatchingShows],
      [
        { ...createShow(), id: 2 },
        { ...createShow(), watch_progress: progress },
      ],
    );

    useShowWatchProgressCache().applyWatchProgress({ ...progress, updated_at: '2026-11-01' });

    expect(queryClient.getQueryState([ShowQueryKey.ContinueWatchingShows])?.isInvalidated).toBe(true);
  });

  it('refetches every show list and nothing else', () => {
    for (const queryKey of Object.values(ShowQueryKey)) {
      queryClient.setQueryData([queryKey], []);
    }
    queryClient.setQueryData(['categories'], []);

    useShowWatchProgressCache().refetchShowLists();

    for (const queryKey of Object.values(ShowQueryKey)) {
      expect(queryClient.getQueryState([queryKey])?.isInvalidated).toBe(true);
    }
    expect(queryClient.getQueryState(['categories'])?.isInvalidated).toBe(false);
  });

  it('patches a streamed watch status and only marks the filtered lists stale', () => {
    const show = { id: 1, entries: [{ id: 10, show_id: 1, watch_status: null }], watch_progress: null };
    const searchKey = [ShowQueryKey.SearchShows, 'term', 1];
    queryClient.setQueryData(searchKey, { data: [show] });
    queryClient.setQueryData([ShowQueryKey.ContinueWatchingShows], [show]);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    useShowWatchProgressCache().applyWatchStatus({ show_id: 1, show_entry_id: 10, status: WatchStatus.Completed });

    const searchShows = queryClient.getQueryData<{ data: (typeof show)[] }>(searchKey);
    expect(searchShows?.data[0]?.entries[0]?.watch_status?.status).toBe(WatchStatus.Completed);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: [ShowQueryKey.SearchShows], refetchType: 'none' });
    expect(queryClient.getQueryState([ShowQueryKey.ContinueWatchingShows])?.isInvalidated).toBe(false);

    useShowWatchProgressCache().applyWatchStatus({ show_id: 1, show_entry_id: 10, status: null });
    const cleared = queryClient.getQueryData<{ data: (typeof show)[] }>(searchKey);
    expect(cleared?.data[0]?.entries[0]?.watch_status).toBeNull();
  });
});
