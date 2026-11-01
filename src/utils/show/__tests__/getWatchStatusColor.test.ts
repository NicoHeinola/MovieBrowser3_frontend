import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { MainTheme } from '@/plugins/vuetify/MainTheme';
import { getWatchStatusColor } from '../getWatchStatusColor';
import { MIXED_WATCH_STATUS_COLOR } from '../mixedWatchStatusColor';

describe('getWatchStatusColor', () => {
  it('returns a theme color for every watch status', () => {
    for (const status of Object.values(WatchStatus)) {
      expect(MainTheme.colors).toHaveProperty(getWatchStatusColor(status));
    }
  });

  it('gives every watch status and the mixed state a distinct hex value', () => {
    const colorNames = [
      ...Object.values(WatchStatus).map((status) => getWatchStatusColor(status)),
      MIXED_WATCH_STATUS_COLOR,
    ];
    const hexValues = colorNames.map((name) => MainTheme.colors?.[name]?.toLowerCase());

    expect(new Set(hexValues).size).toBe(colorNames.length);
  });
});
