import type { ReleasedChangelogEntry } from '@/interfaces/changelog/ReleasedChangelogEntry';
import { describe, expect, it } from 'vitest';

import { getUnseenChangelogEntries } from '../getUnseenChangelogEntries';

const createEntry = (version: string): ReleasedChangelogEntry => ({ version, date: '2026-01-01', changes: [] });

const entries: ReleasedChangelogEntry[] = [createEntry('1.2.0'), createEntry('1.1.0'), createEntry('1.0.0')];

describe('getUnseenChangelogEntries', () => {
  it('returns the entries newer than the last seen version', () => {
    expect(getUnseenChangelogEntries(entries, '1.0.0').map((entry) => entry.version)).toEqual(['1.2.0', '1.1.0']);
  });

  it('returns nothing when the latest version was seen', () => {
    expect(getUnseenChangelogEntries(entries, '1.2.0')).toEqual([]);
  });

  it('returns only the latest entry when no version was seen', () => {
    expect(getUnseenChangelogEntries(entries, null)).toEqual([entries[0]]);
  });

  it('returns only the latest entry when the seen version is not listed', () => {
    expect(getUnseenChangelogEntries(entries, '0.9.0')).toEqual([entries[0]]);
  });

  it('returns nothing when there are no entries', () => {
    expect(getUnseenChangelogEntries([], null)).toEqual([]);
  });
});
