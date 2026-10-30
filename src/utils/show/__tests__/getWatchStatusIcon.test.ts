import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getWatchStatusIcon } from '../getWatchStatusIcon';

describe('getWatchStatusIcon', () => {
  it('returns an icon for every watch status', () => {
    for (const status of Object.values(WatchStatus)) {
      expect(getWatchStatusIcon(status)).toMatch(/^mdi-/);
    }
  });
});
