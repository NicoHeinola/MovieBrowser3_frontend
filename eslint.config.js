import tseslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';
import vuetify from 'eslint-config-vuetify';
import pluginVue from 'eslint-plugin-vue';

/** Matches any export statement, for the one-export-per-file rule. */
const exportDeclaration = ':matches(ExportNamedDeclaration, ExportDefaultDeclaration)';

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
    // One exported symbol per file; barrels re-export a namespace's public surface instead.
    files: ['src/**/*.ts'],
    ignores: ['src/**/index.ts', 'src/**/*.d.ts', 'src/**/__tests__/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // A second top-level export after the first one.
          selector: `Program > ${exportDeclaration} ~ ${exportDeclaration}`,
          message: 'Export one symbol per file. Move this export to a sibling file named after it.',
        },
        {
          // `export const a = 1, b = 2;`
          selector: 'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator ~ VariableDeclarator',
          message: 'Export one symbol per file. Move this export to a sibling file named after it.',
        },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/padding-line-between-tags': 'off',
      // Spacing utilities (margin, padding, gap) use even steps, plus 5 (20px), which matches Vuetify's dialog and
      // toolbar insets. Typography uses the MD3 scale, because Vuetify 4 no longer ships the MD2 classes.
      'vue/no-restricted-class': [
        'error',
        '/^[mp][atrblsexy]?-n?(1|3|7|9|11|13|15)$/', // margin and padding, such as ma-1, px-3, mt-n7
        '/^g[acr]-(1|3|7|9|11|13|15)$/', // gap, such as ga-1, gr-3
        '/^text-(h[1-6]|subtitle-[12]|body-[12]|caption|overline|button)$/', // MD2 typography, such as text-caption
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
