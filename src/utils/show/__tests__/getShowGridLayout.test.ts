import { describe, expect, it } from 'vitest';

import { getShowGridLayout } from '../getShowGridLayout';

describe('getShowGridLayout', () => {
  it.each([
    { viewportWidth: 2560, pageSize: 32, width: 2464 },
    { viewportWidth: 2559, pageSize: 35, width: 2152 },
    { viewportWidth: 1920, pageSize: 30, width: 1528 },
    { viewportWidth: 1366, pageSize: 32, width: 1216 },
    { viewportWidth: 3840, pageSize: 36, width: 3712 },
  ])('fits whole rows on a $viewportWidth pixel wide screen', ({ viewportWidth, pageSize, width }) => {
    expect(getShowGridLayout(viewportWidth)).toEqual({ pageSize, width });
  });

  it('keeps one column on a screen narrower than a card', () => {
    expect(getShowGridLayout(320)).toEqual({ pageSize: 32, width: 280 });
  });

  it('keeps at least one row on a very wide screen', () => {
    expect(getShowGridLayout(20_000).pageSize).toBe(63);
  });
});
