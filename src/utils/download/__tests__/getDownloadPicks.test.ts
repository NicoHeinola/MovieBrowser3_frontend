import { describe, expect, it } from 'vitest';

import { getDownloadPicks } from '../getDownloadPicks';

/**
 * A torrent file pick.
 * @param id - The download's id.
 * @param fileIndex - The file's index.
 * @returns The pick.
 */
const pick = (id: number, fileIndex: number) => ({ id, file_index: fileIndex, path: `Batch/${fileIndex}.mkv` });

describe('getDownloadPicks', () => {
  it('groups saved episodes by download, ordered by file', () => {
    const picks = getDownloadPicks([
      {
        episodes: [
          { id: 10, download: pick(1, 4) },
          { id: 11, download: null },
        ],
      },
      {
        episodes: [
          { id: 12, download: pick(1, 2) },
          { id: 13, download: pick(2, 0) },
        ],
      },
    ]);

    expect([...picks.entries()]).toEqual([
      [
        1,
        [
          { index: 2, episode_id: 12 },
          { index: 4, episode_id: 10 },
        ],
      ],
      [2, [{ index: 0, episode_id: 13 }]],
    ]);
  });

  it('leaves out episodes that are not saved yet', () => {
    expect(getDownloadPicks([{ episodes: [{ download: pick(1, 0) }] }]).size).toBe(0);
  });

  it("leaves out files that already are their episode's video", () => {
    const picks = getDownloadPicks([
      {
        episodes: [
          { id: 10, download: { ...pick(1, 0), imported_at: '2026-11-23T19:32:00Z' } },
          { id: 11, download: { ...pick(1, 1), imported_at: null } },
        ],
      },
    ]);

    expect([...picks.entries()]).toEqual([[1, [{ index: 1, episode_id: 11 }]]]);
  });

  it('handles entries without episodes', () => {
    expect(getDownloadPicks([{}]).size).toBe(0);
  });
});
