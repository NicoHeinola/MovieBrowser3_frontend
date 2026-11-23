import { describe, expect, it } from 'vitest';

import { getMagnetName } from '../getMagnetName';

describe('getMagnetName', () => {
  it('reads the decoded display name', () => {
    expect(getMagnetName('magnet:?xt=urn:btih:abc&dn=%5BGroup%5D%20Show%20S01&tr=udp%3A%2F%2Ft')).toBe(
      '[Group] Show S01',
    );
  });

  it('is null without a name', () => {
    expect(getMagnetName('magnet:?xt=urn:btih:abc')).toBeNull();
    expect(getMagnetName('magnet:?xt=urn:btih:abc&dn=%20')).toBeNull();
  });
});
