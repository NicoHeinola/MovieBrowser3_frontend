import type { BackgroundRunStatus } from '@/interfaces/api/models/BackgroundRunStatus';
import { describe, expect, it } from 'vitest';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';

import { getBackgroundRunOutcome } from '../getBackgroundRunOutcome';

const createStatus = (overrides: Partial<BackgroundRunStatus> = {}): BackgroundRunStatus => ({
  running: false,
  finished_at: null,
  error: null,
  ...overrides,
});

describe('getBackgroundRunOutcome', () => {
  it('has no outcome on the first read', () => {
    expect(getBackgroundRunOutcome(undefined, createStatus({ finished_at: '2026-11-05T10:00:00Z' }))).toBeNull();
  });

  it('has no outcome while a run is in progress', () => {
    expect(getBackgroundRunOutcome(createStatus(), createStatus({ running: true }))).toBeNull();
  });

  it('has no outcome when nothing changed', () => {
    expect(getBackgroundRunOutcome(createStatus(), createStatus())).toBeNull();
  });

  it('is finished when a run gets a new finish time', () => {
    const current = createStatus({ finished_at: '2026-11-05T10:00:00Z' });

    expect(getBackgroundRunOutcome(createStatus({ running: true }), current)).toBe('finished');
  });

  it('is finished when a run ended between two reads', () => {
    const current = createStatus({ finished_at: '2026-11-05T10:00:00Z' });

    expect(getBackgroundRunOutcome(createStatus(), current)).toBe('finished');
  });

  it('is failed when the finished run has an error', () => {
    const current = createStatus({
      finished_at: '2026-11-05T10:00:00Z',
      error: { code: ApiErrorCode.VideoBaseFolderUnavailable, params: {} },
    });

    expect(getBackgroundRunOutcome(createStatus({ running: true }), current)).toBe('failed');
  });

  it('is interrupted when a run stops without a new finish time', () => {
    const finishedAt = '2026-11-05T10:00:00Z';
    const previous = createStatus({ running: true, finished_at: finishedAt });

    expect(getBackgroundRunOutcome(previous, createStatus({ finished_at: finishedAt }))).toBe('interrupted');
  });
});
