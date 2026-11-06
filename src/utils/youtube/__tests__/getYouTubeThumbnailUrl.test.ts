import { describe, expect, it } from 'vitest';

import { getYouTubeThumbnailUrl } from '../getYouTubeThumbnailUrl';

describe('getYouTubeThumbnailUrl', () => {
  it('builds the thumbnail url from the video id', () => {
    expect(getYouTubeThumbnailUrl('dQw4w9WgXcQ')).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg');
  });
});
