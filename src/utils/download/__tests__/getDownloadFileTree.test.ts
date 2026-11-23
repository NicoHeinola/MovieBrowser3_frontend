import { describe, expect, it } from 'vitest';

import { getDownloadFileTree } from '../getDownloadFileTree';

/**
 * A torrent file.
 * @param index - Its index.
 * @param path - Its path.
 * @param size - Its size.
 * @returns The file.
 */
const file = (index: number, path: string, size = 10) => ({
  index,
  path,
  size_bytes: size,
  progress: 0,
  episode_id: null,
  show_id: null,
});

describe('getDownloadFileTree', () => {
  it('nests files in their folders, folders first, in natural order, with folder sizes', () => {
    expect(
      getDownloadFileTree([
        file(0, 'Batch/Show - 10.mkv'),
        file(1, 'Batch/Show - 2.mkv'),
        file(2, 'Batch/Extras/NCOP.mkv', 5),
        file(3, 'notes.txt', 1),
      ]),
    ).toEqual([
      {
        id: 'folder:Batch',
        title: 'Batch',
        sizeBytes: 25,
        children: [
          {
            id: 'folder:Batch/Extras',
            title: 'Extras',
            sizeBytes: 5,
            children: [{ id: 2, title: 'NCOP.mkv', sizeBytes: 5 }],
          },
          { id: 1, title: 'Show - 2.mkv', sizeBytes: 10 },
          { id: 0, title: 'Show - 10.mkv', sizeBytes: 10 },
        ],
      },
      { id: 3, title: 'notes.txt', sizeBytes: 1 },
    ]);
  });

  it('is empty without files', () => {
    expect(getDownloadFileTree([])).toEqual([]);
  });
});
