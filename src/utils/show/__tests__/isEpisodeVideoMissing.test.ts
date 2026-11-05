import { describe, expect, it } from 'vitest';

import { isEpisodeVideoMissing } from '../isEpisodeVideoMissing';

describe('isEpisodeVideoMissing', () => {
  it('is false when the backend finds the file', () => {
    expect(isEpisodeVideoMissing({ id: 1, filename: 'episode.mkv', has_video_file: true })).toBe(false);
  });

  it('is true when the backend can not find the file', () => {
    expect(isEpisodeVideoMissing({ id: 1, filename: 'episode.mkv', has_video_file: false })).toBe(true);
  });

  it('is true when a saved episode has no filename', () => {
    expect(isEpisodeVideoMissing({ id: 1, filename: '', has_video_file: true })).toBe(true);
  });

  it('is false when a replacement file is picked', () => {
    const file = new File([''], 'episode.mkv');

    expect(isEpisodeVideoMissing({ id: 1, file, filename: 'old.mkv', has_video_file: false })).toBe(false);
  });

  it('is false for an unsaved episode with a picked file', () => {
    expect(isEpisodeVideoMissing({ file: new File([''], 'episode.mkv') })).toBe(false);
  });

  it('is true for an unsaved episode whose picked file was cleared', () => {
    expect(isEpisodeVideoMissing({ file: null, filename: 'episode.mkv' })).toBe(true);
  });

  it('is true for an unsaved episode without a file', () => {
    expect(isEpisodeVideoMissing({})).toBe(true);
  });
});
