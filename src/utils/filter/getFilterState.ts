import type { FilterChipState } from '@/components/common/filter-chip';

/**
 * Resolves whether a value is included, excluded or not filtered on.
 * @param included - The included values.
 * @param excluded - The excluded values.
 * @param value - The value to look up.
 * @returns The value's filter state.
 */
export const getFilterState = <T>(included: T[], excluded: T[], value: T): FilterChipState => {
  if (included.includes(value)) return 'include';
  if (excluded.includes(value)) return 'exclude';
  return null;
};
