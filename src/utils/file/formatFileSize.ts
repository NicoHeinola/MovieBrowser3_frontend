const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/**
 * Formats a byte count as a short, readable size in 1024 steps, such as `1.5 GB`.
 * @param bytes - The size in bytes.
 * @param locale - The language to format the number in, such as the i18n `locale`; `fi` writes `1,5 GB`.
 * @returns The size with one decimal above bytes.
 */
export const formatFileSize = (bytes: number, locale: string): string => {
  // Step up a unit while the value still reaches the next one, stopping at the largest unit.
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  const digits = unitIndex === 0 ? 0 : 1;
  const number = value.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  return `${number} ${UNITS[unitIndex]}`;
};
