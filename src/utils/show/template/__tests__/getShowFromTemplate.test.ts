import type { ShowTemplate } from '@/interfaces/api/models/ShowTemplate';

import { afterEach, describe, expect, it } from 'vitest';

import { AppLocale } from '@/enums/locale/AppLocale';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { i18n } from '@/plugins/i18n';
import { getShowFromTemplate } from '../getShowFromTemplate';

/**
 * Builds a template with the given changes.
 * @param overrides - The fields to change.
 * @returns The template.
 */
const createTemplate = (overrides: Partial<ShowTemplate> = {}): ShowTemplate => ({
  source_url: 'https://nekobt.to/media/s1453',
  titles: ['Saga of Tanya the Evil', 'Youjo Senki'],
  description: 'Tanya fights on the front lines.',
  banner_url: 'https://example.com/banner.jpg',
  card_image_url: 'https://example.com/cover.jpg',
  preview_url: null,
  categories: [{ id: 1, name: 'Action', value: 'action', icon: null }] as ShowTemplate['categories'],
  unmatched_genres: [],
  ...overrides,
});

describe('getShowFromTemplate', () => {
  afterEach(() => {
    i18n.global.locale.value = AppLocale.English;
  });

  it('builds a new show with the first title primary, its categories, images and description', () => {
    const show = getShowFromTemplate(createTemplate());

    expect(show.id).toBeUndefined();
    expect(show.titles).toEqual([
      { title: 'Saga of Tanya the Evil', is_primary: true },
      { title: 'Youjo Senki', is_primary: false },
    ]);
    expect(show.description).toBe('Tanya fights on the front lines.');
    expect(show.banner_url).toBe('https://example.com/banner.jpg');
    expect(show.card_image_url).toBe('https://example.com/cover.jpg');
    expect(show.preview_url).toBeNull();
    expect(show.categories?.map((category) => category.id)).toEqual([1]);
    expect(show.outgoing_links).toEqual([]);
    expect(show.incoming_links).toEqual([]);
  });

  it('leaves seasons and episodes to the user: one empty season, named like the ones the editor adds', () => {
    i18n.global.locale.value = AppLocale.Finnish;

    expect(getShowFromTemplate(createTemplate()).entries).toEqual([
      { name: 'Season 1', type: ShowEntryType.Season, sort_order: 0, episodes: [] },
    ]);
  });

  it('fills the gaps of a sparse template like a new show: one empty title and empty texts', () => {
    const show = getShowFromTemplate(
      createTemplate({ titles: [], description: null, banner_url: null, card_image_url: null }),
    );

    expect(show.titles).toEqual([{ title: '', is_primary: true }]);
    expect(show.description).toBe('');
    expect(show.banner_url).toBe('');
    expect(show.card_image_url).toBe('');
  });
});
