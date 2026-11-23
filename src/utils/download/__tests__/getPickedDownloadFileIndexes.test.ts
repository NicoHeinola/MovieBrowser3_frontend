import { describe, expect, it } from 'vitest';

import { getPickedDownloadFileIndexes } from '../getPickedDownloadFileIndexes';

describe('getPickedDownloadFileIndexes', () => {
  it('lists the files of one download picked in any entry, saved or not', () => {
    const indexes = getPickedDownloadFileIndexes(
      [
        { episodes: [{ download: { id: 1, file_index: 3, path: 'a.mkv' } }, { download: null }] },
        {
          episodes: [
            { download: { id: 1, file_index: 0, path: 'b.mkv' } },
            { download: { id: 2, file_index: 5, path: 'c.mkv' } },
          ],
        },
        {},
      ],
      1,
    );

    expect([...indexes].toSorted()).toEqual([0, 3]);
  });
});
