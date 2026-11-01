import type { LanguageOption } from '@/interfaces/locale/LanguageOption';

import { AppLocale } from '@/enums/locale/AppLocale';

/** Every language the user can pick. */
export const languageOptions: LanguageOption[] = [
  { locale: AppLocale.English, name: 'English' },
  { locale: AppLocale.Finnish, name: 'Suomi' },
];
