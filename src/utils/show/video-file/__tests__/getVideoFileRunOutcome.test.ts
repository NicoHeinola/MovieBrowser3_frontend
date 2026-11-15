import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import { describe, expect, it } from 'vitest';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';

import { getVideoFileRunOutcome } from '../getVideoFileRunOutcome';

const createStatus = (overrides: Partial<VideoFileCheckStatus> = {}): VideoFileCheckStatus => ({
  running: false,
  checked: 0,
  total: 0,
  finished_at: null,
  error: null,
  missing_video_files_count: 0,
  ...overrides,
});

describe('getVideoFileRunOutcome', () => {
  it('has no outcome on the first read', () => {
    expect(getVideoFileRunOutcome(undefined, createStatus({ finished_at: '2026-11-05T10:00:00Z' }))).toBeNull();
  });

  it('has no outcome while a check runs', () => {
    expect(getVideoFileRunOutcome(createStatus(), createStatus({ running: true }))).toBeNull();
  });

  it('has no outcome when nothing changed', () => {
    expect(getVideoFileRunOutcome(createStatus(), createStatus())).toBeNull();
  });

  it('is finished when a run gets a new finish time', () => {
    const current = createStatus({ finished_at: '2026-11-05T10:00:00Z' });

    expect(getVideoFileRunOutcome(createStatus({ running: true }), current)).toBe('finished');
  });

  it('is finished when a run ended between two reads', () => {
    const current = createStatus({ finished_at: '2026-11-05T10:00:00Z' });

    expect(getVideoFileRunOutcome(createStatus(), current)).toBe('finished');
  });

  it('is failed when the finished run has an error', () => {
    const current = createStatus({
      finished_at: '2026-11-05T10:00:00Z',
      error: { code: ApiErrorCode.VideoBasePathUnavailable, params: {} },
    });

    expect(getVideoFileRunOutcome(createStatus({ running: true }), current)).toBe('failed');
  });

  it('is interrupted when a run stops without a new finish time', () => {
    const finishedAt = '2026-11-05T10:00:00Z';
    const previous = createStatus({ running: true, finished_at: finishedAt });

    expect(getVideoFileRunOutcome(previous, createStatus({ finished_at: finishedAt }))).toBe('interrupted');
  });
});
