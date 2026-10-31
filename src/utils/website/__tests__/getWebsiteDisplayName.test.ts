import { describe, expect, it } from 'vitest';

import { getWebsiteDisplayName } from '../getWebsiteDisplayName';

describe('getWebsiteDisplayName', () => {
  it('prefers the title', () => {
    expect(getWebsiteDisplayName({ title: 'Docs', url: 'https://example.com' })).toBe('Docs');
  });

  it('falls back to the hostname for a missing or blank title', () => {
    expect(getWebsiteDisplayName({ title: null, url: 'https://www.example.com' })).toBe('example.com');
    expect(getWebsiteDisplayName({ title: '  ', url: 'https://example.com' })).toBe('example.com');
  });
});
