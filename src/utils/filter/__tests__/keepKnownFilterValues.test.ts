import { describe, expect, it } from 'vitest';

import { keepKnownFilterValues } from '../keepKnownFilterValues';

describe('keepKnownFilterValues', () => {
  it('returns the same selection when every value is known', () => {
    const value = { included: ['a'], excluded: ['b'] };

    expect(keepKnownFilterValues(value, ['a', 'b', 'c'])).toBe(value);
  });

  it('drops unknown included and excluded values', () => {
    expect(keepKnownFilterValues({ included: ['a', 'x'], excluded: ['y', 'b'] }, ['a', 'b'])).toEqual({
      included: ['a'],
      excluded: ['b'],
    });
  });

  it('drops everything without options', () => {
    expect(keepKnownFilterValues({ included: ['a'], excluded: ['b'] }, [])).toEqual({ included: [], excluded: [] });
  });
});
