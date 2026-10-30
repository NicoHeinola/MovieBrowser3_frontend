import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getWatchStatusColor } from '../getWatchStatusColor';

describe('getWatchStatusColor', () => {
  it('returns a distinct color for every watch status', () => {
    const colors = Object.values(WatchStatus).map((status) => getWatchStatusColor(status));

    expect(new Set(colors).size).toBe(colors.length);
  });
});
