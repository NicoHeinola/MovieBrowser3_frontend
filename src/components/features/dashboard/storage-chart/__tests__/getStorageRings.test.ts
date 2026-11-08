import type { Show } from '@/interfaces/api/models/Show';
import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { describe, expect, it } from 'vitest';

import { getStorageRings } from '../getStorageRings';

const createStats = (overrides: Partial<DashboardStatsResponse> = {}): DashboardStatsResponse => ({
  shows_count: 0,
  shows_added_last_7_days: 0,
  shows_added_last_30_days: 0,
  episodes_count: 0,
  episodes_missing_video_file_count: 0,
  websites_count: 0,
  users_count: 0,
  video_files_total_bytes: 60,
  disk_total_bytes: 100,
  disk_free_bytes: 30,
  ...overrides,
});

const createShow = (id: number, bytes: number): Show =>
  ({ id, entries: [{ episodes: [{ has_video_file: true, video_file_size: bytes }] }] }) as Show;

describe('getStorageRings', () => {
  it('splits the disk into videos, other files and free space', () => {
    const { disk } = getStorageRings(createStats(), []);

    expect(disk).toEqual([
      { kind: 'videos', bytes: 60 },
      { kind: 'otherFiles', bytes: 10 },
      { kind: 'free', bytes: 30 },
    ]);
  });

  it("keeps the backend's order, drops empty shows and groups the rest from the total", () => {
    const shows = [createShow(2, 30), createShow(4, 20), createShow(3, 0)];
    const { shows: slices } = getStorageRings(createStats(), shows);

    expect(slices.map(({ kind, bytes, show }) => [kind, bytes, show?.id])).toEqual([
      ['show', 30, 2],
      ['show', 20, 4],
      ['otherShows', 10, undefined],
      ['gap', 40, undefined],
    ]);
  });

  it('counts videos of shows missing from the list as other shows', () => {
    const { shows: slices } = getStorageRings(createStats(), [createShow(1, 45)]);

    expect(slices.map(({ kind, bytes }) => [kind, bytes])).toEqual([
      ['show', 45],
      ['otherShows', 15],
      ['gap', 40],
    ]);
  });

  it('leaves out the disk ring and the gap when the disk is unknown', () => {
    const rings = getStorageRings(createStats({ disk_total_bytes: null }), [createShow(1, 60)]);

    expect(rings.disk).toBeNull();
    expect(rings.shows).toEqual([{ kind: 'show', bytes: 60, show: createShow(1, 60) }]);
  });

  it('never reports negative other files', () => {
    const { disk } = getStorageRings(createStats({ disk_free_bytes: 90 }), []);

    expect(disk?.[1]).toEqual({ kind: 'otherFiles', bytes: 0 });
  });
});
