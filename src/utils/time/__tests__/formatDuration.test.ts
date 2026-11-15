import { describe, expect, it } from 'vitest';

import { formatDuration } from '../formatDuration';

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(754.9)).toBe('12:34');
  });

  it('adds hours from an hour up', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3725)).toBe('1:02:05');
  });

  it('treats negative values as zero', () => {
    expect(formatDuration(-5)).toBe('0:00');
  });
});
