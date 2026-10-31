import { describe, expect, it } from 'vitest';

import { getQueryString } from '../getQueryString';

describe('getQueryString', () => {
  it('returns a single value', () => {
    expect(getQueryString('naruto')).toBe('naruto');
  });

  it('takes the first string of a repeated param', () => {
    expect(getQueryString([null, 'a', 'b'])).toBe('a');
  });

  it('returns undefined for a missing or valueless param', () => {
    expect(getQueryString(undefined)).toBeUndefined();
    expect(getQueryString(null)).toBeUndefined();
  });
});
