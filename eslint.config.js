import tseslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';
import vuetify from 'eslint-config-vuetify';
import pluginVue from 'eslint-plugin-vue';

export default [
  ...(await vuetify()),
  prettier,
  {
    plugins: {
      '@typescript-eslint': tseslint,
      vue: pluginVue,
    },
    rules: {
      'antfu/top-level-function': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'vue/attributes-order': [
        'error',
        {
          order: [
            'LIST_RENDERING', // v-for
            'TWO_WAY_BINDING', // v-model bindings
            'ATTR_DYNAMIC', // :
            'ATTR_STATIC', // normal
            'ATTR_SHORTHAND_BOOL', // boolean-prop
            'EVENTS', // @functions
            'DEFINITION',
            'GLOBAL',
            'UNIQUE', // key, ref
            'SLOT',
            'RENDER_MODIFIERS',
            'OTHER_DIRECTIVES',
            'CONTENT',
            'CONDITIONALS', // v-if, v-else, v-else-if
          ],
          alphabetical: true,
        },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    rules: {
      'max-len': [
        'error',
        {
          code: 120,
          ignoreComments: true,
          ignoreUrls: true,
        },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/padding-line-between-tags': 'off',
      // Spacing utilities (margin, padding, gap) use even steps, plus 5 (20px), which matches Vuetify's dialog and
      // toolbar insets.
      'vue/no-restricted-class': [
        'error',
        '/^[mp][atrblsexy]?-n?(1|3|7|9|11|13|15)$/', // margin and padding, such as ma-1, px-3, mt-n7
        '/^g[acr]-(1|3|7|9|11|13|15)$/', // gap, such as ga-1, gr-3
      ],
      'vue/max-len': [
        'error',
        {
          code: 120,
          ignoreComments: true,
          ignoreHTMLAttributeValues: false,
          ignoreHTMLTextContents: false,
          ignoreUrls: true,
        },
      ],
    },
  },
];
