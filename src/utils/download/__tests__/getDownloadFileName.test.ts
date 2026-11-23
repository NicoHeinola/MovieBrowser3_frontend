import { describe, expect, it } from 'vitest';

import { getDownloadFileName } from '../getDownloadFileName';

describe('getDownloadFileName', () => {
  it('drops the folders', () => {
    expect(getDownloadFileName('Batch/Season 1/Show - 01.mkv')).toBe('Show - 01.mkv');
  });

  it('keeps a file at the top of the torrent as it is', () => {
    expect(getDownloadFileName('Show - 01.mkv')).toBe('Show - 01.mkv');
  });
});
