import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getEntryWatchStatuses } from '../getEntryWatchStatuses';

const createEntries = (statuses: (WatchStatus | null)[]) =>
  statuses.map((status, index) => ({ watch_status: status ? { show_entry_id: index, status } : null }));

describe('getEntryWatchStatuses', () => {
  it('returns an empty map when there are no entries or statuses', () => {
    expect(getEntryWatchStatuses(undefined).size).toBe(0);
    expect(getEntryWatchStatuses(createEntries([null])).size).toBe(0);
  });

  it('counts entries per unique status', () => {
    const result = getEntryWatchStatuses(
      createEntries([WatchStatus.Completed, WatchStatus.Completed, WatchStatus.Dropped, null]),
    );

    expect(result.size).toBe(2);
    expect(result.get(WatchStatus.Completed)).toBe(2);
    expect(result.get(WatchStatus.Dropped)).toBe(1);
  });
});
