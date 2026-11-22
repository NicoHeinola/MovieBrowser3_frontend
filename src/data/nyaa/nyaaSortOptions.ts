import type { SortOption } from '@/interfaces/search/SortOption';

/** nyaa's sorts for the sort menu, biggest first at the top, as its `s` fields with a leading `-` for descending. */
export const nyaaSortOptions: SortOption[] = [
  { value: '-size', titleKey: 'torrents.sort.largest', icon: 'mdi-sort-numeric-descending' },
  { value: '-id', titleKey: 'sort.newest', icon: 'mdi-sort-calendar-descending' },
  { value: '-seeders', titleKey: 'torrents.sort.mostSeeders', icon: 'mdi-arrow-up-bold' },
  { value: '-downloads', titleKey: 'torrents.sort.mostDownloaded', icon: 'mdi-download' },
  { value: '-comments', titleKey: 'torrents.sort.mostComments', icon: 'mdi-comment-multiple-outline' },
  { value: 'size', titleKey: 'torrents.sort.smallest', icon: 'mdi-sort-numeric-ascending' },
  { value: 'id', titleKey: 'sort.oldest', icon: 'mdi-sort-calendar-ascending' },
];
