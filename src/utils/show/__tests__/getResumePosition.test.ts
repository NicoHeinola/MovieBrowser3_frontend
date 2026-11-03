import { describe, expect, it } from 'vitest';

import { getResumePosition } from '../getResumePosition';

const progress = (positionSeconds: number | null, durationSeconds: number | null) => ({
  show_id: 1,
  show_entry_id: 10,
  episode_id: 100,
  position_seconds: positionSeconds,
  duration_seconds: durationSeconds,
  updated_at: '2026-11-03',
});

describe('getResumePosition', () => {
  it('resumes at the saved position', () => {
    expect(getResumePosition(progress(754, 1440))).toBe(754);
  });

  it('resumes when the duration is unknown', () => {
    expect(getResumePosition(progress(754, null))).toBe(754);
  });

  it('starts over without a position', () => {
    expect(getResumePosition(null)).toBeNull();
    expect(getResumePosition(progress(null, 1440))).toBeNull();
    expect(getResumePosition(progress(0, 1440))).toBeNull();
  });

  it('resumes even right before the end', () => {
    expect(getResumePosition(progress(1430, 1440))).toBe(1430);
  });
});
