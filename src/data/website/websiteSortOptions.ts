import type { SortOption } from '@/interfaces/search/SortOption';

/** Sorts the website search offers, named like the backend sorts. */
export const websiteSortOptions: SortOption[] = [
  {
    value: 'title',
    titleKey: 'sort.name',
    icon: 'mdi-sort-alphabetical-ascending',
  },
  {
    value: '-created_at',
    titleKey: 'sort.newest',
    icon: 'mdi-sort-calendar-descending',
  },
  {
    value: '-updated_at',
    titleKey: 'sort.recentlyUpdated',
    icon: 'mdi-update',
  },
];
