import { describe, expect, it } from 'vitest';

import { getRules } from '../websiteEditDialogRules';

/**
 * Runs every rule of a field and returns the first error, like Vuetify shows it.
 * @param rules - The field's rules.
 * @param value - The value to validate.
 * @returns The first error message, or true when every rule passes.
 */
const validate = <T>(rules: Array<(value: T) => true | string | boolean>, value: T): true | string | boolean => {
  for (const rule of rules) {
    const result = rule(value);

    if (result !== true) {
      return result;
    }
  }

  return true;
};

describe('websiteEditDialogRules', () => {
  const rules = getRules();

  it('requires a URL and accepts one typed without a scheme', () => {
    expect(validate(rules.url, '')).toBe('This field is required');
    expect(validate(rules.url, 'example.com')).toBe(true);
    expect(validate(rules.url, 'https://example.com/path')).toBe(true);
  });

  it('rejects other schemes and overly long URLs', () => {
    expect(validate(rules.url, 'ftp://example.com')).toBe('Enter a valid http or https URL');
    expect(validate(rules.url, `https://example.com/${'a'.repeat(2048)}`)).toBe('Use at most 2048 characters');
  });

  it('limits title, description and tag count like the backend', () => {
    expect(validate(rules.title, 'a'.repeat(256))).toBe('Use at most 255 characters');
    expect(validate(rules.description, 'a'.repeat(5001))).toBe('Use at most 5000 characters');
    expect(
      validate(
        rules.tags,
        Array.from({ length: 50 }, (_, index) => index),
      ),
    ).toBe(true);
    expect(
      validate(
        rules.tags,
        Array.from({ length: 51 }, (_, index) => index),
      ),
    ).toBe('Use at most 50 tags');
  });

  it('requires an http(s) image URL of at most 255 characters', () => {
    expect(validate(rules.imageUrl, '')).toBe('This field is required');
    expect(validate(rules.imageUrl, 'logo.png')).toBe('Enter a valid http or https URL');
    expect(validate(rules.imageUrl, `https://example.com/${'a'.repeat(240)}.png`)).toBe('Use at most 255 characters');
  });
});
