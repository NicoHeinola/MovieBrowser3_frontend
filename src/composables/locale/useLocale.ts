import type { AppLocale } from '@/enums/locale/AppLocale';
import { useStorage } from '@vueuse/core';
import { computed } from 'vue';
import { i18n } from '@/plugins/i18n';
import { isAppLocale } from '@/plugins/i18n/isAppLocale';
import { LOCALE_STORAGE_KEY } from '@/plugins/i18n/localeStorageKey';

/**
 * Reads and changes the app language. The choice is remembered in this browser.
 * @returns The current `locale`, whether the user has picked one (`hasChosenLocale`) and `setLocale`.
 */
export const useLocale = () => {
  /** The language the user picked, or null before the first choice. */
  const storedLocale = useStorage<string | null>(LOCALE_STORAGE_KEY, null);

  const locale = computed<AppLocale>(() => i18n.global.locale.value as AppLocale);

  const hasChosenLocale = computed<boolean>(() => isAppLocale(storedLocale.value));

  /**
   * Switches the app language and remembers it.
   * @param newLocale - The language to use.
   * @returns Nothing.
   */
  const setLocale = (newLocale: AppLocale): void => {
    i18n.global.locale.value = newLocale;
    storedLocale.value = newLocale;
    // Keeps screen readers and browser translation prompts in line with the page language.
    document.documentElement.lang = newLocale;
  };

  return {
    hasChosenLocale,
    locale,
    setLocale,
  };
};
