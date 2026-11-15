import { getFileSizeParts } from './getFileSizeParts';

/**
 * Formats how much of a size is done, both in the total's unit so they compare at a glance, such as `0.5 / 3.3 GB`.
 * @param bytes - The part done, in bytes.
 * @param totalBytes - The whole size, in bytes.
 * @param locale - The language to format the numbers in, such as the i18n `locale`.
 * @returns The part and the total, with the unit once at the end.
 */
export const formatFileSizeRatio = (bytes: number, totalBytes: number, locale: string): string => {
  const part = getFileSizeParts(bytes, locale, totalBytes);
  const total = getFileSizeParts(totalBytes, locale);
  return `${part.number} / ${total.number} ${total.unit}`;
};
