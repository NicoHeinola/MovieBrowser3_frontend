import { describe, expect, it } from 'vitest';

import { magnetUrlRule } from '../magnetUrlRule';

describe('magnetUrlRule', () => {
  it('accepts magnets with a hex or base32 info hash', () => {
    expect(magnetUrlRule('magnet:?xt=urn:btih:12c03cf9cc60ea7c13931e0195fa54903d8af85f&dn=x')).toBe(true);
    expect(magnetUrlRule(' magnet:?dn=x&xt=urn:btih:CLADZ6OMMDVHYE4TDYAZL6SUSA6YV6C7 ')).toBe(true);
  });

  it('rejects links without an info hash', () => {
    expect(magnetUrlRule('https://nyaa.si/view/1')).toBe('Paste a magnet link, starting with magnet:?');
    expect(magnetUrlRule('magnet:?dn=x')).toBe('Paste a magnet link, starting with magnet:?');
    expect(magnetUrlRule('magnet:?xt=urn:btih:12c03cf9')).toBe('Paste a magnet link, starting with magnet:?');
  });
});
