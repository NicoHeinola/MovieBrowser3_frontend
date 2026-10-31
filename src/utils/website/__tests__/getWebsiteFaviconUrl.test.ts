import { describe, expect, it } from 'vitest';

import { getWebsiteFaviconUrl } from '../getWebsiteFaviconUrl';

describe('getWebsiteFaviconUrl', () => {
  it('points at the favicon on the site origin', () => {
    expect(getWebsiteFaviconUrl('https://example.com/some/page?q=1')).toBe('https://example.com/favicon.ico');
    expect(getWebsiteFaviconUrl('http://localhost:8080/admin')).toBe('http://localhost:8080/favicon.ico');
  });

  it('returns null for unparsable URLs', () => {
    expect(getWebsiteFaviconUrl('not a url')).toBeNull();
  });
});
