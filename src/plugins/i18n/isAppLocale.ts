import { AppLocale } from '@/enums/locale/AppLocale';

/**
 * Checks whether a value is a language the app is translated into.
 * @param value - The value to check.
 * @returns Whether the value is an `AppLocale`.
 */
export const isAppLocale = (value: unknown): value is AppLocale => {
  return Object.values(AppLocale).includes(value as AppLocale);
};
