import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import { describe, expect, it } from 'vitest';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';

import { getVideoFileCheckOutcome } from '../getVideoFileCheckOutcome';

const createStatus = (overrides: Partial<VideoFileCheckStatus> = {}): VideoFileCheckStatus => ({
  running: false,
  checked: 0,
  total: 0,
  finished_at: null,
  error: null,
  ...overrides,
});

describe('getVideoFileCheckOutcome', () => {
  it('has no outcome on the first read', () => {
    expect(getVideoFileCheckOutcome(undefined, createStatus({ finished_at: '2026-11-05T10:00:00Z' }))).toBeNull();
  });

  it('has no outcome while a check runs', () => {
    expect(getVideoFileCheckOutcome(createStatus(), createStatus({ running: true }))).toBeNull();
  });

  it('has no outcome when nothing changed', () => {
    expect(getVideoFileCheckOutcome(createStatus(), createStatus())).toBeNull();
  });

  it('is finished when a run gets a new finish time', () => {
    const current = createStatus({ finished_at: '2026-11-05T10:00:00Z' });

    expect(getVideoFileCheckOutcome(createStatus({ running: true }), current)).toBe('finished');
  });

  it('is finished when a run ended between two reads', () => {
    const current = createStatus({ finished_at: '2026-11-05T10:00:00Z' });

    expect(getVideoFileCheckOutcome(createStatus(), current)).toBe('finished');
  });

  it('is failed when the finished run has an error', () => {
    const current = createStatus({
      finished_at: '2026-11-05T10:00:00Z',
      error: { code: ApiErrorCode.VideoBasePathUnavailable, params: {} },
    });

    expect(getVideoFileCheckOutcome(createStatus({ running: true }), current)).toBe('failed');
  });

  it('is interrupted when a run stops without a new finish time', () => {
    const finishedAt = '2026-11-05T10:00:00Z';
    const previous = createStatus({ running: true, finished_at: finishedAt });

    expect(getVideoFileCheckOutcome(previous, createStatus({ finished_at: finishedAt }))).toBe('interrupted');
  });
});
