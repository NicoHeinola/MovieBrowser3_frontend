import { describe, expect, it } from 'vitest';

import { formatDateTime } from '../formatDateTime';

describe('formatDateTime', () => {
  it('formats a timestamp with a medium date and a short time', () => {
    const timestamp = '2026-11-15T14:30:00';

    expect(formatDateTime(timestamp, 'en')).toBe(
      new Date(timestamp).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' }),
    );
    expect(formatDateTime(timestamp, 'en')).toContain('2026');
  });
});
