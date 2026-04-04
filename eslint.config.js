import prettier from 'eslint-config-prettier';
import vuetify from 'eslint-config-vuetify';

export default [
  ...(await vuetify()),
  prettier,
  {
    rules: {
      'antfu/top-level-function': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
