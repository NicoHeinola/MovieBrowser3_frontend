import { describe, expect, it } from 'vitest';

import { filePathRule } from '../filePathRule';

describe('filePathRule', () => {
  it('returns true for empty values so required validation can handle empties', () => {
    expect(filePathRule('')).toBe(true);
  });

  it('returns true for valid unix absolute paths', () => {
    expect(filePathRule('/')).toBe(true);
    expect(filePathRule('/var/media/videos')).toBe(true);
    expect(filePathRule('/var/media/videos/')).toBe(true);
  });

  it('returns true for valid windows drive paths using slash and backslash separators', () => {
    expect(filePathRule('C:\\')).toBe(true);
    expect(filePathRule(String.raw`C:\Media\Videos`)).toBe(true);
    expect(filePathRule('D:/Media/Videos')).toBe(true);
  });

  it('returns true for valid windows UNC paths', () => {
    expect(filePathRule(String.raw`\\server\share`)).toBe(true);
    expect(filePathRule(String.raw`\\server\share\folder`)).toBe(true);
  });

  it('returns an error message for relative or malformed paths', () => {
    expect(filePathRule('relative/path')).toBe('Enter a valid Unix or Windows absolute file path');
    expect(filePathRule('C:folder')).toBe('Enter a valid Unix or Windows absolute file path');
    expect(filePathRule(String.raw`\\server`)).toBe('Enter a valid Unix or Windows absolute file path');
  });
});
