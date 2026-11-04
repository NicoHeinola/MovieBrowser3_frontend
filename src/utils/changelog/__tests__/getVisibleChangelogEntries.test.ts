import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';
import { describe, expect, it } from 'vitest';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

import { getVisibleChangelogEntries } from '../getVisibleChangelogEntries';

describe('getVisibleChangelogEntries', () => {
  it('keeps an unreleased entry that has lines, above the released ones', () => {
    const entries: ChangelogEntry[] = [
      { version: '1.1.0', date: null, changes: [{ type: ChangelogChangeType.Added, text: 'Something new.' }] },
      { version: '1.0.0', date: '2026-01-01', changes: [] },
    ];

    expect(getVisibleChangelogEntries(entries).map((entry) => entry.version)).toEqual(['1.1.0', '1.0.0']);
  });

  it('drops an unreleased entry with no lines yet', () => {
    const entries: ChangelogEntry[] = [
      { version: '1.0.1', date: null, changes: [] },
      { version: '1.0.0', date: '2026-01-01', changes: [] },
    ];

    expect(getVisibleChangelogEntries(entries).map((entry) => entry.version)).toEqual(['1.0.0']);
  });
});
