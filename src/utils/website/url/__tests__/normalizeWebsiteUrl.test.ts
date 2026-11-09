import { describe, expect, it } from 'vitest';

import { normalizeWebsiteUrl } from '../normalizeWebsiteUrl';

describe('normalizeWebsiteUrl', () => {
  it('adds https to URLs without a scheme', () => {
    expect(normalizeWebsiteUrl(' example.com/path ')).toBe('https://example.com/path');
    expect(normalizeWebsiteUrl('//example.com')).toBe('https://example.com');
    expect(normalizeWebsiteUrl('localhost:8080')).toBe('https://localhost:8080');
  });

  it('keeps URLs that already have a scheme', () => {
    expect(normalizeWebsiteUrl('https://example.com')).toBe('https://example.com');
    expect(normalizeWebsiteUrl('HTTPS://example.com')).toBe('HTTPS://example.com');
  });

  it('leaves blank input blank', () => {
    expect(normalizeWebsiteUrl(' '.repeat(3))).toBe('');
  });
});
