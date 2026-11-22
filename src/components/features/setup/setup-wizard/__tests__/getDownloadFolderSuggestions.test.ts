import { describe, expect, it } from 'vitest';

import { getDownloadFolderSuggestions } from '../getDownloadFolderSuggestions';

describe('getDownloadFolderSuggestions', () => {
  it('suggests a folder inside every media folder', () => {
    expect(getDownloadFolderSuggestions(['/mnt/d', '/mnt/h/Vids'])).toEqual([
      '/mnt/d/MovieBrowser3 Downloads',
      '/mnt/h/Vids/MovieBrowser3 Downloads',
    ]);
  });

  it("suggests Windows' shared Downloads folder without media folders", () => {
    expect(getDownloadFolderSuggestions([])).toEqual(['/mnt/c/Users/Public/Downloads/MovieBrowser3 Downloads']);
  });
});
