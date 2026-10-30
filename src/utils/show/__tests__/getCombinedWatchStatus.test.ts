import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getCombinedWatchStatus, MIXED_WATCH_STATUS } from '../getCombinedWatchStatus';

const createEntries = (statuses: (WatchStatus | null)[]) =>
  statuses.map((status, index) => ({ watch_status: status ? { show_entry_id: index, status } : null }));

describe('getCombinedWatchStatus', () => {
  it('returns null when no entry has a status', () => {
    expect(getCombinedWatchStatus(undefined)).toBeNull();
    expect(getCombinedWatchStatus(createEntries([]))).toBeNull();
    expect(getCombinedWatchStatus(createEntries([null, null]))).toBeNull();
  });

  it('returns the shared status when every entry has it', () => {
    expect(getCombinedWatchStatus(createEntries([WatchStatus.Completed, WatchStatus.Completed]))).toBe(
      WatchStatus.Completed,
    );
  });

  it('returns mixed when statuses differ', () => {
    expect(getCombinedWatchStatus(createEntries([WatchStatus.Completed, WatchStatus.Dropped]))).toBe(
      MIXED_WATCH_STATUS,
    );
  });

  it('returns mixed when only some entries have a status', () => {
    expect(getCombinedWatchStatus(createEntries([WatchStatus.Completed, null]))).toBe(MIXED_WATCH_STATUS);
  });
});
