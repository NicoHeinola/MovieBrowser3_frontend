/**
 * plugins/vuetify/index.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

// Composables
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import { ComponentDefaults } from './ComponentDefaults';
import { MainTheme } from './MainTheme';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  defaults: ComponentDefaults,
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
