import { describe, expect, it } from 'vitest';

import { getUnfinishedDownloadIds } from '../getUnfinishedDownloadIds';

describe('getUnfinishedDownloadIds', () => {
  it('lists each download an episode still waits for once', () => {
    const ids = getUnfinishedDownloadIds([
      { episodes: [{ download: { id: 2, file_index: 0, path: 'a.mkv', imported_at: null } }, { download: null }] },
      {
        episodes: [
          { download: { id: 5, file_index: 1, path: 'b.mkv', imported_at: null } },
          { download: { id: 2, file_index: 1, path: 'd.mkv' } },
        ],
      },
      { episodes: [{ download: { id: 9, file_index: 0, path: 'c.mkv', imported_at: '2026-11-23T12:00:00Z' } }] },
      {},
    ]);

    expect(ids.toSorted()).toEqual([2, 5]);
  });

  it('is empty once every picked file is in place', () => {
    const ids = getUnfinishedDownloadIds([
      { episodes: [{ download: { id: 9, file_index: 0, path: 'c.mkv', imported_at: '2026-11-23T12:00:00Z' } }] },
    ]);

    expect(ids).toEqual([]);
  });
});
