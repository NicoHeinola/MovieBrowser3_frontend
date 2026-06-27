import { describe, expect, it } from 'vitest';

import { requiredRule } from '../requiredRule';

describe('requiredRule', () => {
  it('returns true for non-empty input', () => {
    expect(requiredRule('value')).toBe(true);
  });

  it('returns an error message for empty input', () => {
    expect(requiredRule('')).toBe('This field is required');
  });
});
