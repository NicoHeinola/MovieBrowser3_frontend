import type { Show } from '@/interfaces/api/models/Show';

import { describe, expect, it } from 'vitest';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { getShowWatchStatuses } from '../getShowWatchStatuses';

const createShow = (statuses: (WatchStatus | null)[] | undefined): Show =>
  ({
    entries: statuses?.map((status, index) => ({
      id: index,
      watch_status: status ? { show_entry_id: index, status } : null,
    })),
  }) as unknown as Show;

describe('getShowWatchStatuses', () => {
  it('returns an empty map when there are no entries or statuses', () => {
    expect(getShowWatchStatuses(createShow(undefined)).size).toBe(0);
    expect(getShowWatchStatuses(createShow([null])).size).toBe(0);
  });

  it('counts entries per unique status', () => {
    const result = getShowWatchStatuses(
      createShow([WatchStatus.Completed, WatchStatus.Completed, WatchStatus.Dropped, null]),
    );

    expect(result.size).toBe(2);
    expect(result.get(WatchStatus.Completed)).toBe(2);
    expect(result.get(WatchStatus.Dropped)).toBe(1);
  });
});
