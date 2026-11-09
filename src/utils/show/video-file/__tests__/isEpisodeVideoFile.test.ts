import { describe, expect, it } from 'vitest';

import { isEpisodeVideoFile } from '../isEpisodeVideoFile';

describe('isEpisodeVideoFile', () => {
  it.each([
    ['Show - S01E01.mkv', '', true],
    ['Show - S01E01.MP4', '', true],
    ['clip.unknown', 'video/x-matroska', true],
    ['notes.txt', 'text/plain', false],
    ['cover.png', 'image/png', false],
    ['mkv', '', false],
  ])('%s (%s) -> %s', (name, type, expected) => {
    expect(isEpisodeVideoFile({ name, type })).toBe(expected);
  });
});
