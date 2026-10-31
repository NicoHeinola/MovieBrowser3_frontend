/**
 * Adds a value to or removes it from a list without duplicating it.
 * @param values - The current values.
 * @param value - The value to add or remove.
 * @param isAdded - Whether the value should be in the list.
 * @returns The updated values.
 */
export const toggleFilterValue = <T>(values: T[], value: T, isAdded: boolean): T[] => {
  const otherValues = values.filter((existingValue) => existingValue !== value);
  return isAdded ? [...otherValues, value] : otherValues;
};
