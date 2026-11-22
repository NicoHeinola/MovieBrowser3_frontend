import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';

import { describe, expect, it } from 'vitest';

import { hasPendingVideoUploads } from '../hasPendingVideoUploads';

const createEntry = (...files: (File | null | undefined)[]): ShowEntry =>
  ({ episodes: files.map((file) => ({ id: 1, file })) }) as unknown as ShowEntry;

describe('hasPendingVideoUploads', () => {
  it('finds a picked file in any entry', () => {
    const entries = [createEntry(undefined), createEntry(null, new File(['a'], 'a.mkv'))];

    expect(hasPendingVideoUploads({ entries })).toBe(true);
  });

  it('is false without picked files', () => {
    expect(hasPendingVideoUploads({ entries: [createEntry(undefined, null)] })).toBe(false);
  });

  it('is false when the entries are not loaded', () => {
    expect(hasPendingVideoUploads({})).toBe(false);
  });
});
