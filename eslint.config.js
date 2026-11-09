import tseslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';
import vuetify from 'eslint-config-vuetify';
import pluginVue from 'eslint-plugin-vue';

/** Matches an export of a value (constant, function, class, enum); type and interface exports don't count. */
const valueDeclaration = 'VariableDeclaration|FunctionDeclaration|ClassDeclaration|TSEnumDeclaration';
const valueNamedExport = `ExportNamedDeclaration[declaration.type=/^(${valueDeclaration})$/]`;
const valueExport = `:matches(ExportDefaultDeclaration, ${valueNamedExport})`;

/**
 * One exported value per file, together with the types that belong to it (its options, parameters, return shape).
 * Barrels re-export a namespace's public surface instead.
 */
const oneValueExportPerFile = [
  {
    // A second exported value after the first one.
    selector: `Program > ${valueExport} ~ ${valueExport}`,
    message: 'Export one value per file. Move this export to a sibling file named after it.',
  },
  {
    // `export const a = 1, b = 2;`
    selector: 'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator ~ VariableDeclarator',
    message: 'Export one value per file. Move this export to a sibling file named after it.',
  },
];

/** A function exported from `src/composables` must be a `useX` composable. */
const composableNaming = [
  {
    selector: 'ExportNamedDeclaration > FunctionDeclaration[id.name!=/^use[A-Z]/]',
    message: 'Functions in src/composables are composables named useX. Move other helpers to src/utils.',
  },
  {
    selector:
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name!=/^use[A-Z]/]' +
      '[init.type=/^(ArrowFunctionExpression|FunctionExpression)$/]',
    message: 'Functions in src/composables are composables named useX. Move other helpers to src/utils.',
  },
];

/**
 * The layers each layer must not import, so dependencies point one way: pages and components on top, then
 * composables and stores, then services, utils and data, with interfaces and enums at the bottom. Tests may import
 * anything.
 */
const layerBoundaries = [
  {
    files: ['src/interfaces/**', 'src/enums/**'],
    forbidden: [
      'components',
      'composables',
      'data',
      'pages',
      'plugins',
      'router',
      'rules',
      'services',
      'stores',
      'utils',
    ],
    message: 'Interfaces and enums describe shapes; they import only other interfaces and enums.',
  },
  {
    files: ['src/data/**'],
    forbidden: ['components', 'pages', 'plugins', 'router', 'services', 'stores'],
    message: 'Data holds constants; a list that needs Vue code references a composable, nothing higher.',
  },
  {
    files: ['src/utils/**'],
    forbidden: ['components', 'composables', 'pages', 'router', 'services', 'stores'],
    message: 'Utilities are plain helpers. Move shared types to src/interfaces and logic that needs state up a layer.',
  },
  {
    files: ['src/rules/**'],
    forbidden: ['components', 'composables', 'pages', 'router', 'services', 'stores'],
    message: 'Validation rules are plain functions; they may only use utilities, plugins (i18n) and types.',
  },
  {
    files: ['src/services/**'],
    forbidden: ['components', 'composables', 'data', 'pages', 'router', 'stores'],
    message: 'Services wrap backend calls; stores, composables and components call them, never the other way.',
  },
  {
    files: ['src/stores/**'],
    forbidden: ['components', 'composables', 'pages', 'router'],
    message: 'Stores hold client state and call services; UI layers use stores, not the other way.',
  },
  {
    // plugins/index.ts is the startup wiring that connects plugins to stores, so it may import them.
    files: ['src/plugins/**'],
    ignores: ['src/plugins/index.ts'],
    forbidden: ['components', 'composables', 'pages', 'router', 'stores'],
    message: 'Plugins set up libraries; only plugins/index.ts wires them to stores.',
  },
  {
    files: ['src/composables/**', 'src/components/**'],
    forbidden: ['pages'],
    message: 'Pages are entry points of routes; nothing but the router imports them.',
  },
].map(({ files, ignores = [], forbidden, message }) => ({
  files,
  ignores: [...ignores, 'src/**/__tests__/**'],
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: [{ group: forbidden.flatMap((layer) => [`@/${layer}`, `@/${layer}/*`]), message }] },
    ],
  },
}));

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
    files: ['src/**/*.ts'],
    ignores: ['src/**/index.ts', 'src/**/*.d.ts', 'src/**/__tests__/**'],
    rules: {
      'no-restricted-syntax': ['error', ...oneValueExportPerFile],
    },
  },
  {
    // Flat config replaces a rule's options instead of merging them, so this repeats the one-value-export rule.
    files: ['src/composables/**/*.ts'],
    ignores: ['src/**/index.ts', 'src/**/*.d.ts', 'src/**/__tests__/**'],
    rules: {
      'no-restricted-syntax': ['error', ...oneValueExportPerFile, ...composableNaming],
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
  ...layerBoundaries,
];
