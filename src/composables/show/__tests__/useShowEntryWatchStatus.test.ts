import type * as VueQuery from '@tanstack/vue-query';
import { QueryClient } from '@tanstack/vue-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { showEntryWatchStatusService } from '@/services/show/showEntryWatchStatusService';
import { useShowEntryWatchStatus } from '../useShowEntryWatchStatus';

const queryClient = new QueryClient();

vi.mock('@tanstack/vue-query', async (importOriginal) => ({
  ...(await importOriginal<typeof VueQuery>()),
  useQueryClient: () => queryClient,
}));

vi.mock('@/services/show/showEntryWatchStatusService', () => ({
  showEntryWatchStatusService: {
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

interface CachedShow {
  id: number;
  entries: { id: number; show_id: number; watch_status: unknown }[];
}

const createShow = (watchStatus: unknown = null): CachedShow => ({
  id: 1,
  entries: [{ id: 10, show_id: 1, watch_status: watchStatus }],
});

const getCachedStatus = (queryKey: unknown[], getShows: (data: never) => CachedShow[]): unknown => {
  return getShows(queryClient.getQueryData(queryKey) as never)[0]?.entries[0]?.watch_status;
};

describe('useShowEntryWatchStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('saves the status and patches every cached show list', async () => {
    queryClient.setQueryData([ShowQueryKey.HomeShows], { latestShows: [createShow()] });
    queryClient.setQueryData([ShowQueryKey.SearchShows, 'term', 1], { data: [createShow()] });

    const { saveWatchStatus } = useShowEntryWatchStatus();
    const result = await saveWatchStatus({ id: 10, show_id: 1 }, WatchStatus.Completed);

    const expected = { show_entry_id: 10, status: WatchStatus.Completed };
    expect(result).toEqual(expected);
    expect(showEntryWatchStatusService.update).toHaveBeenCalledWith(10, { status: WatchStatus.Completed });
    expect(
      getCachedStatus([ShowQueryKey.HomeShows], (data: { latestShows: CachedShow[] }) => data.latestShows),
    ).toEqual(expected);
    expect(getCachedStatus([ShowQueryKey.SearchShows, 'term', 1], (data: { data: CachedShow[] }) => data.data)).toEqual(
      expected,
    );
  });

  it('removes the status when cleared', async () => {
    const dropped = { show_entry_id: 10, status: WatchStatus.Dropped };
    queryClient.setQueryData([ShowQueryKey.HomeShows], [createShow(dropped)]);

    const { saveWatchStatus } = useShowEntryWatchStatus();
    const result = await saveWatchStatus({ id: 10, show_id: 1 }, null);

    expect(result).toBeNull();
    expect(showEntryWatchStatusService.remove).toHaveBeenCalledWith(10);
    expect(getCachedStatus([ShowQueryKey.HomeShows], (data: CachedShow[]) => data)).toBeNull();
  });

  it('leaves the cache untouched when saving fails', async () => {
    const data = [createShow()];
    queryClient.setQueryData([ShowQueryKey.HomeShows], data);
    vi.mocked(showEntryWatchStatusService.update).mockRejectedValue(new Error('fail'));

    const { saveWatchStatus } = useShowEntryWatchStatus();

    await expect(saveWatchStatus({ id: 10, show_id: 1 }, WatchStatus.Completed)).rejects.toThrow('fail');
    expect(queryClient.getQueryData([ShowQueryKey.HomeShows])).toBe(data);
  });
});
