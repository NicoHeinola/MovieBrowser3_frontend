import type { SortOption } from '@/components/common/sort-menu';

/** Sorts the show search offers, as backend sort values. */
export const showSortOptions: SortOption[] = [
  { value: '-created_at', title: 'Newest', icon: 'mdi-sort-calendar-descending' },
  { value: 'title', title: 'Name', icon: 'mdi-sort-alphabetical-ascending' },
  { value: '-last_watched_at', title: 'Last watched', icon: 'mdi-history' },
  { value: '-updated_at', title: 'Recently updated', icon: 'mdi-update' },
];
