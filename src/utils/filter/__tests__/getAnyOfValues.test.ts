import { describe, expect, it } from 'vitest';

import { getAnyOfValues } from '../getAnyOfValues';

const all = ['a', 'b', 'c'];

describe('getAnyOfValues', () => {
  it('filters nothing without chips', () => {
    expect(getAnyOfValues({ included: [], excluded: [] }, all)).toEqual([]);
  });

  it('allows the included values', () => {
    expect(getAnyOfValues({ included: ['c', 'a'], excluded: [] }, all)).toEqual(['c', 'a']);
  });

  it('allows every other value when only some are excluded', () => {
    expect(getAnyOfValues({ included: [], excluded: ['b'] }, all)).toEqual(['a', 'c']);
  });

  it('drops excluded values from the included ones', () => {
    expect(getAnyOfValues({ included: ['a', 'b'], excluded: ['b'] }, all)).toEqual(['a']);
  });
});
