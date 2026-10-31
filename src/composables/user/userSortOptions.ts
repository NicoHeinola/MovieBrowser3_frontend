import type { SortOption } from '@/components/common/sort-menu';

/** Sorts the user search offers, named like the backend sorts. */
export const userSortOptions: SortOption[] = [
  { value: 'username', title: 'Username', icon: 'mdi-sort-alphabetical-ascending' },
  { value: '-is_admin', title: 'Admins first', icon: 'mdi-shield-crown' },
  { value: '-created_at', title: 'Newest', icon: 'mdi-sort-calendar-descending' },
  { value: 'created_at', title: 'Oldest', icon: 'mdi-sort-calendar-ascending' },
];
