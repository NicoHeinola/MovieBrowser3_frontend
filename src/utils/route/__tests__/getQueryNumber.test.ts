import { describe, expect, it } from 'vitest';

import { getQueryNumber } from '../getQueryNumber';

describe('getQueryNumber', () => {
  it('reads a whole number', () => {
    expect(getQueryNumber('12')).toBe(12);
    expect(getQueryNumber('0')).toBe(0);
  });

  it('takes the first value of a repeated param', () => {
    expect(getQueryNumber(['5', '9'])).toBe(5);
  });

  it('returns null for a missing, empty or invalid value', () => {
    expect(getQueryNumber(undefined)).toBeNull();
    expect(getQueryNumber('')).toBeNull();
    expect(getQueryNumber('abc')).toBeNull();
    expect(getQueryNumber('1e3')).toBeNull();
    expect(getQueryNumber('-4')).toBeNull();
    expect(getQueryNumber('2.5')).toBeNull();
  });
});
