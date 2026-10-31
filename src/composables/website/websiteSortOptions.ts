import type { SortOption } from '@/components/common/sort-menu';

/** Sorts the website search offers, named like the backend sorts. */
export const websiteSortOptions: SortOption[] = [
  { value: 'title', title: 'Name', icon: 'mdi-sort-alphabetical-ascending' },
  { value: '-created_at', title: 'Newest', icon: 'mdi-sort-calendar-descending' },
  { value: '-updated_at', title: 'Recently updated', icon: 'mdi-update' },
];
