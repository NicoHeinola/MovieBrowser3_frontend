import { describe, expect, it } from 'vitest';

import { getEntryVideoBytes } from '../getEntryVideoBytes';

describe('getEntryVideoBytes', () => {
  it('sums the sizes of episodes that have a file', () => {
    const entry = {
      episodes: [
        { has_video_file: true, video_file_size: 100 },
        { has_video_file: true, video_file_size: 50 },
      ],
    };

    expect(getEntryVideoBytes(entry)).toBe(150);
  });

  it('counts missing files and unmeasured sizes as 0', () => {
    const entry = {
      episodes: [
        { has_video_file: false, video_file_size: 100 },
        { has_video_file: true, video_file_size: null },
        { has_video_file: true, video_file_size: 25 },
      ],
    };

    expect(getEntryVideoBytes(entry)).toBe(25);
  });

  it('is 0 without episodes', () => {
    expect(getEntryVideoBytes({})).toBe(0);
  });
});
