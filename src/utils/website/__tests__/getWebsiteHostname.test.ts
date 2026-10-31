import { describe, expect, it } from 'vitest';

import { getWebsiteHostname } from '../getWebsiteHostname';

describe('getWebsiteHostname', () => {
  it('returns the hostname without www', () => {
    expect(getWebsiteHostname('https://www.example.com/path?q=1')).toBe('example.com');
    expect(getWebsiteHostname('https://docs.example.com:8080')).toBe('docs.example.com');
  });

  it('returns unparsable URLs as-is', () => {
    expect(getWebsiteHostname('not a url')).toBe('not a url');
  });
});
