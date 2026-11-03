import { describe, expect, it } from 'vitest';

import { formatPlaybackTime } from '../formatPlaybackTime';

describe('formatPlaybackTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatPlaybackTime(0)).toBe('0:00');
    expect(formatPlaybackTime(65)).toBe('1:05');
    expect(formatPlaybackTime(754.9)).toBe('12:34');
  });

  it('adds hours from an hour up', () => {
    expect(formatPlaybackTime(3600)).toBe('1:00:00');
    expect(formatPlaybackTime(3725)).toBe('1:02:05');
  });

  it('treats negative values as zero', () => {
    expect(formatPlaybackTime(-5)).toBe('0:00');
  });
});
