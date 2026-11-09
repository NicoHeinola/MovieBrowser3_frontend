import type { ChipsFilterValue } from '@/interfaces/search/ChipsFilterValue';

/**
 * Drops selected values that have no option, such as a deleted tag or a mistyped URL value. They would keep filtering
 * the results without a chip to turn them off.
 * @param value - The chips selection.
 * @param knownValues - The values that have an option.
 * @returns The selection without unknown values, or the same object when nothing was dropped.
 */
export const keepKnownFilterValues = (value: ChipsFilterValue, knownValues: string[]): ChipsFilterValue => {
  const isKnown = (selected: string): boolean => knownValues.includes(selected);

  if (value.included.every((selected) => isKnown(selected)) && value.excluded.every((selected) => isKnown(selected))) {
    return value;
  }

  return {
    included: value.included.filter((selected) => isKnown(selected)),
    excluded: value.excluded.filter((selected) => isKnown(selected)),
  };
};
