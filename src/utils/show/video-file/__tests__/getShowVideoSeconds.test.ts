import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';

import { describe, expect, it } from 'vitest';

import { getShowVideoSeconds } from '../getShowVideoSeconds';

const createEntry = (...episodes: [boolean, number | null][]): ShowEntry =>
  ({
    episodes: episodes.map(([hasFile, seconds]) => ({ has_video_file: hasFile, video_duration_seconds: seconds })),
  }) as ShowEntry;

describe('getShowVideoSeconds', () => {
  it('sums the known lengths of every entry', () => {
    expect(getShowVideoSeconds({ entries: [createEntry([true, 1440], [true, 1500]), createEntry([true, 60])] })).toBe(
      3000,
    );
  });

  it('counts missing files and unknown lengths as 0', () => {
    expect(getShowVideoSeconds({ entries: [createEntry([false, 1440], [true, null], [true, 30])] })).toBe(30);
  });

  it('is 0 when the entries are not loaded', () => {
    expect(getShowVideoSeconds({})).toBe(0);
  });
});
