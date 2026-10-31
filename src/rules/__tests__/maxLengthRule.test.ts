import { describe, expect, it } from 'vitest';

import { maxLengthRule } from '../maxLengthRule';

describe('maxLengthRule', () => {
  const rule = maxLengthRule(5);

  it('passes empty values and values within the limit', () => {
    expect(rule('')).toBe(true);
    expect(rule(null)).toBe(true);
    expect(rule(undefined)).toBe(true);
    expect(rule('12345')).toBe(true);
  });

  it('returns an error message for longer values', () => {
    expect(rule('123456')).toBe('Use at most 5 characters');
  });
});
