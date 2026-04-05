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
            'LIST_RENDERING',        // v-for
            'TWO_WAY_BINDING',       // v-model bindings
            'ATTR_DYNAMIC',         // :
            'ATTR_STATIC',          // normal
            'ATTR_SHORTHAND_BOOL',  // boolean-prop
            'EVENTS',               // @functions
            'CONDITIONALS',         // v-if
            'DEFINITION',
            'GLOBAL',
            'UNIQUE',               // key, ref
            'SLOT',
            'RENDER_MODIFIERS',
            'OTHER_DIRECTIVES',
            'CONTENT',
          ],
          alphabetical: true,
        },
      ],
    },
  },
];
