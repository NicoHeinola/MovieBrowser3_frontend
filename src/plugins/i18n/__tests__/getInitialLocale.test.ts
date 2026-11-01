import { afterEach, describe, expect, it } from 'vitest';

import { AppLocale } from '@/enums/locale/AppLocale';

import { getInitialLocale } from '../getInitialLocale';
import { getStoredLocale } from '../getStoredLocale';
import { LOCALE_STORAGE_KEY } from '../localeStorageKey';

describe('getStoredLocale and getInitialLocale', () => {
  afterEach(() => localStorage.clear());

  it('reads the language the user picked', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'fi');

    expect(getStoredLocale()).toBe(AppLocale.Finnish);
    expect(getInitialLocale()).toBe(AppLocale.Finnish);
  });

  it('ignores unknown stored values', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'sv');

    expect(getStoredLocale()).toBeNull();
  });

  it('falls back to a supported language', () => {
    expect(Object.values(AppLocale)).toContain(getInitialLocale());
  });
});
