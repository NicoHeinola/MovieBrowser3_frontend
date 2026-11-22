import type { Episode } from '@/interfaces/api/models/Episode';

import { afterEach, describe, expect, it } from 'vitest';

import { AppLocale } from '@/enums/locale/AppLocale';
import { i18n } from '@/plugins/i18n';
import { getEpisodeName } from '../getEpisodeName';

/**
 * Builds an episode with the given name and position.
 * @param name - The episode name, empty for none.
 * @param sequenceNumber - The 0-based position.
 * @returns The episode.
 */
const createEpisode = (name: string, sequenceNumber: number): Episode => ({
  id: 1,
  show_entry_id: 2,
  name,
  filename: 'episode.mkv',
  has_video_file: true,
  video_file_size: null,
  video_duration_seconds: null,
  sequence_number: sequenceNumber,
});

describe('getEpisodeName', () => {
  afterEach(() => {
    i18n.global.locale.value = AppLocale.English;
  });

  it('uses the episode name', () => {
    expect(getEpisodeName(createEpisode('Pilot', 0))).toBe('Pilot');
  });

  it('falls back to the 1-based position in the current language', () => {
    i18n.global.locale.value = AppLocale.English;
    expect(getEpisodeName(createEpisode('', 2))).toBe('Episode 3');

    i18n.global.locale.value = AppLocale.Finnish;
    expect(getEpisodeName(createEpisode('', 2))).toBe('Jakso 3');
  });
});
