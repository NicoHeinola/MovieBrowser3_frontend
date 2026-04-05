import { describe, expect, it } from 'vitest';
import { isYouTubeUrl } from '../isYouTubeUrl';

describe('isYouTubeUrl', () => {
  it('should return true for valid YouTube URLs', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
  });

  it('should return false for non-YouTube URLs', () => {
    expect(isYouTubeUrl('https://google.com')).toBe(false);
    expect(isYouTubeUrl('not-a-url')).toBe(false);
    expect(isYouTubeUrl('')).toBe(false);
  });

  it('should return false for undefined/null input', () => {
    expect(isYouTubeUrl(undefined)).toBe(false);
  });
});
