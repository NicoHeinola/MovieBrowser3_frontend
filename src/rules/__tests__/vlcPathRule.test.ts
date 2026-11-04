import { describe, expect, it } from 'vitest';

import { vlcPathRule } from '../vlcPathRule';

const errorMessage = 'Enter a full path starting with /, such as /mnt/g/Videos';

describe('vlcPathRule', () => {
  it('accepts vlc on the PATH, a full path and an empty value', () => {
    expect(vlcPathRule('vlc')).toBe(true);
    expect(vlcPathRule('/mnt/c/Program Files/VideoLAN/VLC/vlc.exe')).toBe(true);
    expect(vlcPathRule('')).toBe(true);
  });

  it('returns an error message for windows and other relative paths', () => {
    expect(vlcPathRule(String.raw`C:\VLC\vlc.exe`)).toBe(errorMessage);
    expect(vlcPathRule('bin/vlc')).toBe(errorMessage);
  });
});
