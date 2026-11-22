import type { ChipsFilterValue } from '@/interfaces/search/ChipsFilterValue';

/**
 * Turns include and exclude chips into one list of allowed values, for a backend that only takes a list where any
 * value matches. Included chips list the allowed values (less any excluded); with only excluded chips, every other
 * value is allowed.
 * @param chips - The chips selection.
 * @param allValues - Every value the filter has.
 * @returns The allowed values, or an empty list when nothing filters.
 */
export const getAnyOfValues = ({ included, excluded }: ChipsFilterValue, allValues: string[]): string[] => {
  const allowed = included.length > 0 ? included : excluded.length > 0 ? allValues : [];

  return allowed.filter((value) => !excluded.includes(value));
};
