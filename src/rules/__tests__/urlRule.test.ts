import { describe, expect, it } from 'vitest';

import { urlRule } from '../urlRule';

describe('urlRule', () => {
  it('returns true for valid http and https URLs', () => {
    expect(urlRule('http://example.com')).toBe(true);
    expect(urlRule('https://example.com/path?query=1')).toBe(true);
  });

  it('returns an error message for non-http protocols', () => {
    expect(urlRule('ftp://example.com')).toBe('Enter a valid http or https URL');
  });

  it('returns an error message for invalid URL values', () => {
    expect(urlRule('not-a-url')).toBe('Enter a valid http or https URL');
  });
});
