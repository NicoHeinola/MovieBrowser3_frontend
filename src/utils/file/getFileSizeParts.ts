const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/**
 * Splits a byte count into a readable number and its unit, in 1024 steps, such as `1.5` and `GB`.
 * @param bytes - The size in bytes.
 * @param locale - The language to format the number in, such as the i18n `locale`; `fi` writes `1,5`.
 * @param unitBytes - The size that picks the unit, such as a total, so a part of it reads in the same unit. Defaults
 * to `bytes`.
 * @returns The number, with one decimal above bytes, and the unit.
 */
export const getFileSizeParts = (
  bytes: number,
  locale: string,
  unitBytes: number = bytes,
): { number: string; unit: string } => {
  // Step up a unit while the size that picks it still reaches the next one, stopping at the largest unit.
  let unitIndex = 0;
  while (unitBytes >= 1024 ** (unitIndex + 1) && unitIndex < UNITS.length - 1) {
    unitIndex++;
  }

  const digits = unitIndex === 0 ? 0 : 1;
  const value = bytes / 1024 ** unitIndex;
  const number = value.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  return { number, unit: UNITS[unitIndex]! };
};
