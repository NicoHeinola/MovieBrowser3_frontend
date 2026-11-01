/**
 * Formats a changelog release date for display, such as "Nov 1, 2026".
 * @param date - The release date as `YYYY-MM-DD`.
 * @param locale - The locale to format for; defaults to the browser's.
 * @returns The formatted date.
 */
export const formatChangelogDate = (date: string, locale?: string): string => {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number);

  // Build a local date: `new Date('YYYY-MM-DD')` is UTC midnight, which shows the previous day west of UTC.
  return new Date(year, month - 1, day).toLocaleDateString(locale, { dateStyle: 'medium' });
};
