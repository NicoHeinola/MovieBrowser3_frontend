import { describe, expect, it } from 'vitest';

import { nekoBtSortValues } from '../nekoBtSortValues';

describe('nekoBtSortValues', () => {
  it('lists each sort once, with the biggest-first default and both directions of every field but best', () => {
    expect(new Set(nekoBtSortValues).size).toBe(nekoBtSortValues.length);
    expect(nekoBtSortValues).toContain('-size');
    expect(nekoBtSortValues).toContain('best');
    expect(nekoBtSortValues).not.toContain('-best');
    expect(nekoBtSortValues.filter((value) => value !== 'best').every((value) => /^-?[a-z]+$/.test(value))).toBe(true);
  });
});
