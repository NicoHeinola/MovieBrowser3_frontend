import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { AppLocale } from '@/enums/locale/AppLocale';
import { i18n } from '@/plugins/i18n';
import { LOCALE_STORAGE_KEY } from '@/plugins/i18n/localeStorageKey';

import { useLocale } from '../useLocale';

describe('useLocale', () => {
  afterEach(() => {
    i18n.global.locale.value = AppLocale.English;
    localStorage.clear();
  });

  it('switches the app language and remembers the choice', async () => {
    const { hasChosenLocale, locale, setLocale } = useLocale();

    expect(hasChosenLocale.value).toBe(false);

    setLocale(AppLocale.Finnish);
    // `useStorage` writes to localStorage on the next tick.
    await nextTick();

    expect(locale.value).toBe(AppLocale.Finnish);
    expect(i18n.global.t('common.cancel')).toBe('Peruuta');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(AppLocale.Finnish);
    expect(document.documentElement.lang).toBe(AppLocale.Finnish);
    expect(hasChosenLocale.value).toBe(true);
  });
});
