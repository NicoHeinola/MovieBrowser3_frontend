import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';

import { describe, expect, it } from 'vitest';

import { getShowVideoBytes } from '../getShowVideoBytes';

const createEntry = (...sizes: (number | null)[]): ShowEntry =>
  ({ episodes: sizes.map((size) => ({ has_video_file: true, video_file_size: size })) }) as ShowEntry;

describe('getShowVideoBytes', () => {
  it('sums every entry', () => {
    expect(getShowVideoBytes({ entries: [createEntry(10, 20), createEntry(5, null)] })).toBe(35);
  });

  it('is 0 when the entries are not loaded', () => {
    expect(getShowVideoBytes({})).toBe(0);
  });
});
