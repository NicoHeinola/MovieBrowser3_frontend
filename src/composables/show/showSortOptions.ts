import type { SortOption } from '@/components/common/sort-menu';

/** Sorts the show search offers, as backend sort values. */
export const showSortOptions: SortOption[] = [
  {
    value: '-created_at',
    titleKey: 'sort.newest',
    icon: 'mdi-sort-calendar-descending',
  },
  {
    value: 'title',
    titleKey: 'sort.name',
    icon: 'mdi-sort-alphabetical-ascending',
  },
  {
    value: '-last_watched_at',
    titleKey: 'sort.lastWatched',
    icon: 'mdi-history',
  },
  {
    value: '-updated_at',
    titleKey: 'sort.recentlyUpdated',
    icon: 'mdi-update',
  },
];
