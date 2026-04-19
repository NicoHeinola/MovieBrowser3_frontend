import { createI18n } from 'vue-i18n';

import enMessages from './en.json';

type MessageSchema = typeof enMessages;

export const i18n = createI18n<[MessageSchema], 'en'>({
  fallbackLocale: 'en',
  legacy: false,
  locale: 'en',
  messages: {
    en: enMessages,
  },
});
