import { getFileSizeParts } from './getFileSizeParts';

/**
 * Formats a byte count as a short, readable size in 1024 steps, such as `1.5 GB`.
 * @param bytes - The size in bytes.
 * @param locale - The language to format the number in, such as the i18n `locale`; `fi` writes `1,5 GB`.
 * @returns The size with one decimal above bytes.
 */
export const formatFileSize = (bytes: number, locale: string): string => {
  const { number, unit } = getFileSizeParts(bytes, locale);
  return `${number} ${unit}`;
};
