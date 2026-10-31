import { describe, expect, it } from 'vitest';

import { toggleFilterValue } from '../toggleFilterValue';

describe('toggleFilterValue', () => {
  it('adds a value once', () => {
    expect(toggleFilterValue(['a'], 'b', true)).toEqual(['a', 'b']);
    expect(toggleFilterValue(['a', 'b'], 'b', true)).toEqual(['a', 'b']);
  });

  it('removes a value', () => {
    expect(toggleFilterValue(['a', 'b'], 'a', false)).toEqual(['b']);
    expect(toggleFilterValue(['b'], 'a', false)).toEqual(['b']);
  });
});
