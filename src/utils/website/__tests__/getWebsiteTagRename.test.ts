import { describe, expect, it } from 'vitest';

import { getWebsiteTagRename } from '../getWebsiteTagRename';

describe('getWebsiteTagRename', () => {
  it('returns the trimmed new name', () => {
    expect(getWebsiteTagRename('docs', '  Docs ')).toBe('Docs');
  });

  it('returns null for blank or unchanged names', () => {
    expect(getWebsiteTagRename('docs', ' '.repeat(3))).toBeNull();
    expect(getWebsiteTagRename('docs', null)).toBeNull();
    expect(getWebsiteTagRename('docs', ' docs ')).toBeNull();
  });
});
