import { describe, expect, it } from 'vitest';

import { getFilterState } from '../getFilterState';

describe('getFilterState', () => {
  it('resolves included, excluded and unfiltered values', () => {
    expect(getFilterState([1], [2], 1)).toBe('include');
    expect(getFilterState([1], [2], 2)).toBe('exclude');
    expect(getFilterState([1], [2], 3)).toBeNull();
  });
});
