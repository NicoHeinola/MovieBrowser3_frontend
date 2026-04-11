import { describe, expect, it } from 'vitest';
import { getYouTubeVideoId } from '../getYouTubeVideoId';

describe('getYouTubeVideoId', () => {
  it('should return the correct video ID for standard watch URLs', () => {
    expect(getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(getYouTubeVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should return the correct video ID for shortened URLs', () => {
    expect(getYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should return the correct video ID for embed URLs', () => {
    expect(getYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should return the correct video ID from URLs with additional parameters', () => {
    expect(getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe('dQw4w9WgXcQ');
    expect(getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ#t=10s')).toBe('dQw4w9WgXcQ');
    expect(getYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?si=abcdef')).toBe('dQw4w9WgXcQ');
  });

  it('should return null for invalid YouTube URLs', () => {
    expect(getYouTubeVideoId('https://www.google.com')).toBeNull();
    expect(getYouTubeVideoId('https://youtube.com/about')).toBeNull();
    expect(getYouTubeVideoId('https://youtu.be/short')).toBeNull();
  });

  it('should return null for empty, undefined, or null input', () => {
    expect(getYouTubeVideoId('')).toBeNull();
    expect(getYouTubeVideoId(undefined)).toBeNull();
  });
});
