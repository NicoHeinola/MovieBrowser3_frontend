import { describe, expect, it } from 'vitest';

import { getEpisodeNameFromFilename } from '../getEpisodeNameFromFilename';

describe('getEpisodeNameFromFilename', () => {
  it.each([
    ['[Ironclad] Yani Neko - S01E04 [WEB.1080p.AV1].mkv', 'Yani Neko - S01E04'],
    ['[Judas] Grand Blue - S03E10.mkv', 'Grand Blue - S03E10'],
    ['[Judas] KimiShinu - S01E07.mkv', 'KimiShinu - S01E07'],
    [
      '[Trix] You and I Are Polar Opposites S02E06 v2 [WEBRip 1080p AV1] (Dual Audio, Multi Subs)',
      'You and I Are Polar Opposites - S02E06',
    ],
    ['[Anime Time] Youjo Senki - 04', 'Youjo Senki - 04'],
    ['[Anime Time] Youjo Senki - Movie', 'Youjo Senki - Movie'],
    ['[EMBER] Grand Blue S2 - 06.mkv', 'Grand Blue S2 - 06'],
  ])('cleans release filename %s', (filename, expected) => {
    expect(getEpisodeNameFromFilename(filename)).toBe(expected);
  });

  it('handles dot-separated scene release names', () => {
    expect(getEpisodeNameFromFilename('Show.Name.s01e02.1080p.WEB-DL.x264-GROUP.mkv')).toBe('Show Name - S01E02');
  });

  it('keeps an episode title that follows the marker', () => {
    expect(getEpisodeNameFromFilename('Show_Name_S01E02 - The Beginning [720p].mp4')).toBe(
      'Show Name - S01E02 - The Beginning',
    );
  });

  it('falls back to Untitled when nothing meaningful remains', () => {
    expect(getEpisodeNameFromFilename('[Group] [1080p].mkv')).toBe('Untitled');
  });
});
