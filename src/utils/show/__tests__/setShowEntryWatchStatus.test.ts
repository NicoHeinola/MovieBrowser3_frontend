import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { setShowEntryWatchStatus } from '../setShowEntryWatchStatus';

const createShow = (id: number) => ({
  id,
  entries: [
    { id: id * 10, show_id: id, watch_status: null },
    { id: id * 10 + 1, show_id: id, watch_status: null },
  ],
});

describe('setShowEntryWatchStatus', () => {
  const status = { show_entry_id: 10, status: WatchStatus.Completed };

  it('updates the entry in every list that contains the show and keeps other shows untouched', () => {
    const data = { latest: [createShow(1), createShow(2)], random: [createShow(1)] };

    const result = setShowEntryWatchStatus(data, 1, 10, status);

    expect(result.latest[0]!.entries[0]!.watch_status).toEqual(status);
    expect(result.latest[0]!.entries[1]!.watch_status).toBeNull();
    expect(result.random[0]!.entries[0]!.watch_status).toEqual(status);
    expect(result.latest[1]).toBe(data.latest[1]);
    expect(data.latest[0]!.entries[0]!.watch_status).toBeNull();
  });

  it('clears the status and supports paginated responses', () => {
    const data = { data: [createShow(1)], meta: { total: 1 } };
    const set = setShowEntryWatchStatus(data, 1, 10, status);

    expect(setShowEntryWatchStatus(set, 1, 10, null).data[0]!.entries[0]!.watch_status).toBeNull();
  });

  it('returns the same reference when no show matches', () => {
    const data = [createShow(1)];

    expect(setShowEntryWatchStatus(data, 99, 10, status)).toBe(data);
  });

  it('ignores objects with a matching id that do not own the entry', () => {
    const data = [{ id: 1, entries: [{ id: 99, show_id: 1, watch_status: null }] }];

    expect(setShowEntryWatchStatus(data, 1, 10, status)).toBe(data);
  });
});
