import { describe, expect, it } from 'vitest';
import { getYouTubeEmbedUrl } from '../getYouTubeEmbedUrl';

describe('getYouTubeEmbedUrl', () => {
  it('should extract video ID and return embed URL', () => {
    const videoId = 'dQw4w9WgXcQ';
    const expected = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1`;

    expect(getYouTubeEmbedUrl(`https://www.youtube.com/watch?v=${videoId}`)).toBe(expected);
    expect(getYouTubeEmbedUrl(`https://youtu.be/${videoId}`)).toBe(expected);
    expect(getYouTubeEmbedUrl(`https://www.youtube.com/embed/${videoId}`)).toBe(expected);
  });

  it('should return null for invalid YouTube URLs or missing video IDs', () => {
    expect(getYouTubeEmbedUrl('https://google.com')).toBe(null);
    expect(getYouTubeEmbedUrl('https://youtube.com/watch?v=too-short')).toBe(null);
    expect(getYouTubeEmbedUrl('')).toBe(null);
    expect(getYouTubeEmbedUrl(undefined)).toBe(null);
  });
});
