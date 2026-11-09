import { describe, expect, it } from 'vitest';

import { getShowGridLayout } from '../getShowGridLayout';

describe('getShowGridLayout', () => {
  it.each([
    { name: '1440p browser window', viewportWidth: 2560, viewportHeight: 1251, pageSize: 32, width: 2464 },
    { name: '1440p full screen', viewportWidth: 2560, viewportHeight: 1440, pageSize: 40, width: 2464 },
    { name: '1080p browser window', viewportWidth: 1920, viewportHeight: 893, pageSize: 15, width: 1528 },
    { name: '4K browser window', viewportWidth: 3840, viewportHeight: 1971, pageSize: 96, width: 3712 },
    { name: 'laptop browser window', viewportWidth: 1366, viewportHeight: 625, pageSize: 8, width: 1216 },
  ])('fits whole rows and columns in a $name', ({ viewportWidth, viewportHeight, pageSize, width }) => {
    expect(getShowGridLayout(viewportWidth, viewportHeight)).toEqual({ pageSize, width });
  });

  it('keeps one column and two rows on a window smaller than a card', () => {
    expect(getShowGridLayout(320, 200)).toEqual({ pageSize: 2, width: 280 });
  });
});
