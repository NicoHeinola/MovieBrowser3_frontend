import type { NyaaOption } from '@/interfaces/nyaa/NyaaOption';

/** The nyaa categories a show can come from, English-translated anime first, as nyaa's `c` codes. */
export const nyaaCategories: NyaaOption[] = [
  { value: '1_2', titleKey: 'torrents.nyaa.categories.animeEnglish', icon: 'mdi-translate' },
  { value: '1_0', titleKey: 'torrents.nyaa.categories.anime', icon: 'mdi-television-classic' },
  { value: '1_3', titleKey: 'torrents.nyaa.categories.animeNonEnglish', icon: 'mdi-earth' },
  { value: '1_4', titleKey: 'torrents.nyaa.categories.animeRaw', icon: 'mdi-filmstrip' },
  { value: '1_1', titleKey: 'torrents.nyaa.categories.animeMusicVideo', icon: 'mdi-music' },
  { value: '4_0', titleKey: 'torrents.nyaa.categories.liveAction', icon: 'mdi-movie-open' },
  { value: '4_1', titleKey: 'torrents.nyaa.categories.liveActionEnglish', icon: 'mdi-translate' },
  { value: '4_3', titleKey: 'torrents.nyaa.categories.liveActionNonEnglish', icon: 'mdi-earth' },
  { value: '4_4', titleKey: 'torrents.nyaa.categories.liveActionRaw', icon: 'mdi-filmstrip' },
  { value: '0_0', titleKey: 'torrents.nyaa.categories.all', icon: 'mdi-shape' },
];
