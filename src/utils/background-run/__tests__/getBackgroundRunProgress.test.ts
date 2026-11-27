import { describe, expect, it } from 'vitest';

import { getBackgroundRunProgress } from '../getBackgroundRunProgress';

describe('getBackgroundRunProgress', () => {
  it('has no percentage while the run still counts the episodes', () => {
    expect(getBackgroundRunProgress(0, 0)).toEqual({ progress: null, progressText: 'Counting episodes...' });
  });

  it('gives the rounded percentage and the episode count', () => {
    expect(getBackgroundRunProgress(1, 3)).toEqual({ progress: 33, progressText: '1 of 3 episodes' });
  });
});
