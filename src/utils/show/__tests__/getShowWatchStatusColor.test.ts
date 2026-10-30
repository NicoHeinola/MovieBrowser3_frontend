import type { Show } from '@/interfaces/api/models/Show';

import { describe, expect, it } from 'vitest';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { getShowWatchStatusColor, MIXED_WATCH_STATUS_COLOR } from '../getShowWatchStatusColor';
import { getWatchStatusColor } from '../getWatchStatusColor';

const createShow = (statuses: (WatchStatus | null)[]): Show =>
  ({
    entries: statuses.map((status, index) => ({
      id: index,
      watch_status: status ? { show_entry_id: index, status } : null,
    })),
  }) as unknown as Show;

describe('getShowWatchStatusColor', () => {
  it('returns null when no entry has a status', () => {
    expect(getShowWatchStatusColor(createShow([]))).toBeNull();
    expect(getShowWatchStatusColor(createShow([null, null]))).toBeNull();
  });

  it('returns the status color when every entry shares one status', () => {
    expect(getShowWatchStatusColor(createShow([WatchStatus.Completed, WatchStatus.Completed]))).toBe(
      getWatchStatusColor(WatchStatus.Completed),
    );
  });

  it('returns the mixed color when statuses differ', () => {
    expect(getShowWatchStatusColor(createShow([WatchStatus.Completed, WatchStatus.Dropped]))).toBe(
      MIXED_WATCH_STATUS_COLOR,
    );
  });

  it('returns the mixed color when some entries have no status', () => {
    expect(getShowWatchStatusColor(createShow([WatchStatus.Completed, null]))).toBe(MIXED_WATCH_STATUS_COLOR);
  });
});
