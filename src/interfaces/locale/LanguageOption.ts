import type { AppLocale } from '@/enums/locale/AppLocale';

/** A language the user can pick. */
export interface LanguageOption {
  locale: AppLocale;
  /** The language's name in itself, so it stays readable whatever language is active. */
  name: string;
}
