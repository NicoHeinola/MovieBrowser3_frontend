import { describe, expect, it } from 'vitest';

import { getRules } from '../websiteTagCreateDialogRules';

describe('websiteTagCreateDialogRules', () => {
  const [required, maxLength] = getRules().name;

  it('requires a name that is not only spaces', () => {
    expect(required('')).toBe('This field is required');
    expect(required(' '.repeat(3))).toBe('This field is required');
    expect(required('docs')).toBe(true);
  });

  it('limits names to 100 characters like the backend', () => {
    expect(maxLength('a'.repeat(100))).toBe(true);
    expect(maxLength('a'.repeat(101))).toBe('Use at most 100 characters');
  });
});
