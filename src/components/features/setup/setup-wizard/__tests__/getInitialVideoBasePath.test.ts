import { describe, expect, it } from 'vitest';

import { getInitialVideoBasePath } from '../getInitialVideoBasePath';

describe('getInitialVideoBasePath', () => {
  describe('with media folders', () => {
    const mediaFolders = ['/mnt/g/New_Vid'];

    it('keeps a saved path inside a media folder', () => {
      expect(getInitialVideoBasePath('/mnt/g/New_Vid', mediaFolders)).toBe('/mnt/g/New_Vid');
      expect(getInitialVideoBasePath('/mnt/g/New_Vid/Shows', mediaFolders)).toBe('/mnt/g/New_Vid/Shows');
    });

    it('swaps a path outside them for the first suggestion', () => {
      expect(getInitialVideoBasePath('/var/www/storage/app/videos', mediaFolders)).toBe('/mnt/g/New_Vid/MovieBrowser3');
      expect(getInitialVideoBasePath('/mnt/d/Elsewhere', mediaFolders)).toBe('/mnt/g/New_Vid/MovieBrowser3');
    });

    it('compares whole folder names', () => {
      expect(getInitialVideoBasePath('/mnt/g/New_Vid2', mediaFolders)).toBe('/mnt/g/New_Vid/MovieBrowser3');
    });
  });

  describe('without media folders', () => {
    it('keeps a saved path on a Windows drive', () => {
      expect(getInitialVideoBasePath('/mnt/g/New_Vid_Dev', [])).toBe('/mnt/g/New_Vid_Dev');
      expect(getInitialVideoBasePath('/mnt/d', [])).toBe('/mnt/d');
    });

    it('swaps a path inside WSL for the shared Videos folder', () => {
      const suggestion = '/mnt/c/Users/Public/Videos/MovieBrowser3';

      expect(getInitialVideoBasePath('/home/user/backend/storage/app/videos', [])).toBe(suggestion);
      expect(getInitialVideoBasePath('/mnt/wsl/videos', [])).toBe(suggestion);
      expect(getInitialVideoBasePath('', [])).toBe(suggestion);
    });
  });
});
