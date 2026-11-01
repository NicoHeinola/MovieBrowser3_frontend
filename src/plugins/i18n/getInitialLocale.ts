import { AppLocale } from '@/enums/locale/AppLocale';

import { getStoredLocale } from './getStoredLocale';
import { isAppLocale } from './isAppLocale';

/**
 * Picks the language to start with: the stored choice, else the browser language, else English.
 * @returns The initial locale.
 */
export const getInitialLocale = (): AppLocale => {
  const stored = getStoredLocale();

  if (stored !== null) {
    return stored;
  }

  const browserLanguage = typeof navigator === 'undefined' ? '' : navigator.language.slice(0, 2).toLowerCase();
  return isAppLocale(browserLanguage) ? browserLanguage : AppLocale.English;
};
