import { describe, expect, it } from 'vitest';

import { filePathRule } from '../filePathRule';

const errorMessage = 'Enter a full path starting with /, such as /mnt/g/Videos';

describe('filePathRule', () => {
  it('returns true for empty values so required validation can handle empties', () => {
    expect(filePathRule('')).toBe(true);
  });

  it('returns true for valid unix absolute paths', () => {
    expect(filePathRule('/')).toBe(true);
    expect(filePathRule('/var/media/videos')).toBe(true);
    expect(filePathRule('/var/media/videos/')).toBe(true);
  });

  it('returns an error message for windows paths, because the app runs in WSL2', () => {
    expect(filePathRule('C:\\')).toBe(errorMessage);
    expect(filePathRule(String.raw`G:\New_Vid_Dev`)).toBe(errorMessage);
    expect(filePathRule('D:/Media/Videos')).toBe(errorMessage);
    expect(filePathRule(String.raw`\\server\share`)).toBe(errorMessage);
  });

  it('returns an error message for relative paths', () => {
    expect(filePathRule('relative/path')).toBe(errorMessage);
    expect(filePathRule('vlc')).toBe(errorMessage);
  });
});
