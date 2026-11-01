import { describe, expect, it } from 'vitest';

import { formatChangelogDate } from '../formatChangelogDate';

describe('formatChangelogDate', () => {
  it('formats the date in the given locale', () => {
    expect(formatChangelogDate('2026-11-01', 'en-US')).toBe('Nov 1, 2026');
  });

  it('keeps the calendar day regardless of time zone', () => {
    expect(formatChangelogDate('2026-01-01', 'en-US')).toBe('Jan 1, 2026');
  });
});
