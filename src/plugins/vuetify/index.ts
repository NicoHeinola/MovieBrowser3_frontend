/**
 * plugins/vuetify/index.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

import { useI18n } from 'vue-i18n';
// Composables
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';

import { i18n } from '@/plugins/i18n';

import { ComponentDefaults } from './ComponentDefaults';
import { MainTheme } from './MainTheme';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  defaults: ComponentDefaults,
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'MainTheme',
    themes: {
      MainTheme,
    },
  },
});
