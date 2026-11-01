import type { SortOption } from '@/components/common/sort-menu';

/** Sorts the user search offers, named like the backend sorts. */
export const userSortOptions: SortOption[] = [
  {
    value: 'username',
    titleKey: 'sort.username',
    icon: 'mdi-sort-alphabetical-ascending',
  },
  {
    value: '-is_admin',
    titleKey: 'sort.adminsFirst',
    icon: 'mdi-shield-crown',
  },
  {
    value: '-created_at',
    titleKey: 'sort.newest',
    icon: 'mdi-sort-calendar-descending',
  },
  {
    value: 'created_at',
    titleKey: 'sort.oldest',
    icon: 'mdi-sort-calendar-ascending',
  },
];
