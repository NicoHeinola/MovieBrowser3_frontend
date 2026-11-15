import { i18n } from '@/plugins/i18n';

/**
 * Formats a backend timestamp as a date and time, such as "Nov 15, 2026, 2:30 PM".
 * @param timestamp - An ISO 8601 timestamp.
 * @param locale - The locale to format for; defaults to the app language.
 * @returns The formatted date and time.
 */
export const formatDateTime = (timestamp: string, locale: string = i18n.global.locale.value): string => {
  return new Date(timestamp).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
};
