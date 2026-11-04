import { describe, expect, it } from 'vitest';

import { getVideoFolderSuggestions } from '../getVideoFolderSuggestions';

describe('getVideoFolderSuggestions', () => {
  it('suggests a folder inside every media folder', () => {
    expect(getVideoFolderSuggestions(['/mnt/g/New_Vid', '/mnt/h/Vids'])).toEqual([
      '/mnt/g/New_Vid/MovieBrowser3',
      '/mnt/h/Vids/MovieBrowser3',
    ]);
  });

  it("suggests Windows' shared Videos folder without media folders", () => {
    expect(getVideoFolderSuggestions([])).toEqual(['/mnt/c/Users/Public/Videos/MovieBrowser3']);
  });
});
