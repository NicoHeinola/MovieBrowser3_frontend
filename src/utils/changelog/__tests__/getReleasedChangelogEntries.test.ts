import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';
import { describe, expect, it } from 'vitest';

import { getReleasedChangelogEntries } from '../getReleasedChangelogEntries';

describe('getReleasedChangelogEntries', () => {
  it('drops the unreleased entry and keeps the order', () => {
    const entries: ChangelogEntry[] = [
      { version: '1.1.0', date: null, changes: [] },
      { version: '1.0.1', date: '2026-02-01', changes: [] },
      { version: '1.0.0', date: '2026-01-01', changes: [] },
    ];

    expect(getReleasedChangelogEntries(entries).map((entry) => entry.version)).toEqual(['1.0.1', '1.0.0']);
  });

  it('returns nothing when no version is released yet', () => {
    expect(getReleasedChangelogEntries([{ version: '1.0.0', date: null, changes: [] }])).toEqual([]);
  });
});
