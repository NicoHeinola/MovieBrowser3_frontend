import { createI18n } from 'vue-i18n';
import { en as vuetifyEn, fi as vuetifyFi } from 'vuetify/locale';

import { AppLocale } from '@/enums/locale/AppLocale';

import enMessages from './en.json';
import fiMessages from './fi.json';
import { getInitialLocale } from './getInitialLocale';

const initialLocale = getInitialLocale();

// `index.html` hard-codes `lang="en"`; match it to the language the app starts in.
document.documentElement.lang = initialLocale;

export const i18n = createI18n<false>({
  fallbackLocale: AppLocale.English,
  legacy: false,
  locale: initialLocale,
  messages: {
    // Vuetify reads its own component texts (pagination, data tables) from `$vuetify`.
    [AppLocale.English]: { ...enMessages, $vuetify: vuetifyEn },
    [AppLocale.Finnish]: { ...fiMessages, $vuetify: vuetifyFi },
  },
});
