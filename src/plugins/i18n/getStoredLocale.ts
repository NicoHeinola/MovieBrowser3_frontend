import type { AppLocale } from '@/enums/locale/AppLocale';

import { isAppLocale } from './isAppLocale';
import { LOCALE_STORAGE_KEY } from './localeStorageKey';

/**
 * Reads the language the user picked in this browser.
 * @returns The stored locale, or null when the user has not picked one yet.
 */
export const getStoredLocale = (): AppLocale | null => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isAppLocale(stored) ? stored : null;
  } catch {
    // Storage can be blocked, such as in private windows.
    return null;
  }
};
