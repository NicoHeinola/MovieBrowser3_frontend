import { describe, expect, it } from 'vitest';

import { getVideoBaseFolderSuggestions } from '../getVideoBaseFolderSuggestions';

describe('getVideoBaseFolderSuggestions', () => {
  it('suggests a folder inside every media folder', () => {
    expect(getVideoBaseFolderSuggestions(['/mnt/g/New_Vid', '/mnt/h/Vids'])).toEqual([
      '/mnt/g/New_Vid/MovieBrowser3',
      '/mnt/h/Vids/MovieBrowser3',
    ]);
  });

  it("suggests Windows' shared Videos folder without media folders", () => {
    expect(getVideoBaseFolderSuggestions([])).toEqual(['/mnt/c/Users/Public/Videos/MovieBrowser3']);
  });
});
