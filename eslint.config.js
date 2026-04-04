import vuetify from 'eslint-config-vuetify';

export default vuetify({
  rules: {
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'semi': ['error', 'always'],
    'no-extra-semi': 'error',
    '@stylistic/semi': ['error', 'always'],
  },
});
