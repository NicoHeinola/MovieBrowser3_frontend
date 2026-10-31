import { describe, expect, it } from 'vitest';

import { setShowWatchProgress } from '../setShowWatchProgress';

const createShow = (id: number) => ({ id, entries: [], watch_progress: null });

const progress = { show_id: 1, show_entry_id: 10, episode_id: 100, updated_at: '2026-10-30' };

describe('setShowWatchProgress', () => {
  it('updates the show in every list that contains it and keeps other shows untouched', () => {
    const data = { latest: [createShow(1), createShow(2)], random: { data: [createShow(1)] } };

    const result = setShowWatchProgress(data, progress);

    expect(result.latest[0]!.watch_progress).toEqual(progress);
    expect(result.random.data[0]!.watch_progress).toEqual(progress);
    expect(result.latest[1]).toBe(data.latest[1]);
    expect(data.latest[0]!.watch_progress).toBeNull();
  });

  it('returns the same reference when no show matches', () => {
    const data = [createShow(2)];

    expect(setShowWatchProgress(data, progress)).toBe(data);
  });

  it('ignores objects with a matching id that are not shows', () => {
    const data = [{ id: 1, name: 'category' }];

    expect(setShowWatchProgress(data, progress)).toBe(data);
  });
});
