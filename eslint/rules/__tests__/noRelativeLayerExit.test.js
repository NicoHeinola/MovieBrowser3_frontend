import path from 'node:path';

import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import { noRelativeLayerExit } from '../noRelativeLayerExit.js';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const srcDir = path.resolve(import.meta.dirname, '../../../src');

/** The absolute path of a file below `src`, as ESLint passes it to the rule. */
const srcFile = (file) => path.join(srcDir, file);

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 'latest', sourceType: 'module' } });

ruleTester.run('no-relative-layer-exit', noRelativeLayerExit, {
  valid: [
    // A sibling and a parent folder inside the same layer.
    { code: "import vuetify from './vuetify';", filename: srcFile('plugins/index.ts') },
    {
      code: "import { WebsiteIcon } from '../website-icon';",
      filename: srcFile('components/features/website/a/A.vue'),
    },
    // Aliases and packages are the job of the `layerBoundaries` patterns.
    { code: "import router from '@/router';", filename: srcFile('plugins/index.ts') },
    { code: "import { ref } from 'vue';", filename: srcFile('plugins/index.ts') },
    // Files straight in `src` belong to no layer.
    { code: "import App from './App.vue';", filename: srcFile('main.ts') },
    // A dynamic import of a computed path and an export without a source.
    { code: 'const load = (name) => import(name);', filename: srcFile('utils/a/load.ts') },
    { code: 'export const a = 1;', filename: srcFile('utils/a/a.ts') },
  ],
  invalid: [
    {
      code: "import router from '../router';",
      filename: srcFile('plugins/index.ts'),
      output: "import router from '@/router';",
      errors: [{ messageId: 'leavesLayer', data: { layer: 'plugins', alias: '@/router' } }],
    },
    {
      code: "export * from '../../stores/auth/useAuthStore';",
      filename: srcFile('utils/a/a.ts'),
      output: "export * from '@/stores/auth/useAuthStore';",
      errors: [{ messageId: 'leavesLayer' }],
    },
    {
      code: "export { x } from '../../stores/x';",
      filename: srcFile('utils/a/a.ts'),
      output: "export { x } from '@/stores/x';",
      errors: [{ messageId: 'leavesLayer' }],
    },
    {
      code: "const page = () => import('../../pages/guest/auth/AuthView.vue');",
      filename: srcFile('components/a/A.vue'),
      output: "const page = () => import('@/pages/guest/auth/AuthView.vue');",
      errors: [{ messageId: 'leavesLayer' }],
    },
    // Outside `src`, and `src` itself, have no `@/` form, so there is no fix.
    {
      code: "import pkg from '../../../package.json';",
      filename: srcFile('utils/a/a.ts'),
      output: null,
      errors: [{ messageId: 'leavesSrc', data: { layer: 'utils' } }],
    },
    {
      code: "import root from '../..';",
      filename: srcFile('utils/a/a.ts'),
      output: null,
      errors: [{ messageId: 'leavesSrc' }],
    },
  ],
});
