import { describe, expect, it } from 'vitest';

import { AppLocale } from '@/enums/locale/AppLocale';

import { languageOptions } from '../languageOptions';

describe('languageOptions', () => {
  it('lists every language exactly once', () => {
    const locales = languageOptions.map((option) => option.locale).toSorted();

    expect(locales).toEqual(Object.values(AppLocale).toSorted());
  });
});
