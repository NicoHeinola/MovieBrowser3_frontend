import { describe, expect, it } from 'vitest';

import { getQueryStrings } from '../getQueryStrings';

describe('getQueryStrings', () => {
  it('wraps a single value', () => {
    expect(getQueryStrings('anime')).toEqual(['anime']);
  });

  it('keeps the strings of a repeated param and drops empty ones', () => {
    expect(getQueryStrings(['anime', null, '', 'action'])).toEqual(['anime', 'action']);
  });

  it('returns an empty list for a missing param', () => {
    expect(getQueryStrings(undefined)).toEqual([]);
  });
});
