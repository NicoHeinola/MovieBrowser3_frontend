import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';

import { getWatchedEpisodeIds } from '../getWatchedEpisodeIds';

const createEpisode = (id: number) => ({
  id,
  show_entry_id: Math.floor(id / 10),
  name: '',
  filename: '',
  sequence_number: 0,
});

const entries = [
  { id: 1, episodes: [] },
  { id: 2, episodes: [createEpisode(20), createEpisode(21)] },
  { id: 3, episodes: [createEpisode(30), createEpisode(31)] },
];

const progress = (entryId: number, episodeId: number | null) => ({
  show_id: 1,
  show_entry_id: entryId,
  episode_id: episodeId,
  updated_at: '2026-10-31',
});

describe('getWatchedEpisodeIds', () => {
  it('marks every episode before the last started one as watched, across entries', () => {
    expect([...getWatchedEpisodeIds({ entries, watch_progress: progress(3, 31) })]).toEqual([20, 21, 30]);
  });

  it('marks nothing when the first episode is the last started one', () => {
    expect(getWatchedEpisodeIds({ entries, watch_progress: progress(2, 20) }).size).toBe(0);
  });

  it('marks nothing without progress or when the saved episode no longer exists', () => {
    expect(getWatchedEpisodeIds({ entries, watch_progress: null }).size).toBe(0);
    expect(getWatchedEpisodeIds({ entries, watch_progress: progress(2, null) }).size).toBe(0);
    expect(getWatchedEpisodeIds({ entries, watch_progress: progress(3, 99) }).size).toBe(0);
    expect(getWatchedEpisodeIds(null).size).toBe(0);
  });

  it('marks every episode of a completed entry as watched, including the last started one', () => {
    const completed = { show_entry_id: 3, status: WatchStatus.Completed };
    const show = {
      entries: [entries[1]!, { ...entries[2]!, watch_status: completed }],
      watch_progress: progress(3, 31),
    };

    expect([...getWatchedEpisodeIds(show)].toSorted()).toEqual([20, 21, 30, 31]);
  });

  it('ignores entry statuses other than completed', () => {
    const watching = { show_entry_id: 2, status: WatchStatus.Watching };

    expect(getWatchedEpisodeIds({ entries: [{ ...entries[1]!, watch_status: watching }] }).size).toBe(0);
  });
});
