import path from 'node:path';

const srcDir = path.resolve(import.meta.dirname, '../../src');

/** The path of a file below `src`, with forward slashes. It starts with `..` when the file is outside `src`. */
const srcPath = (file) => path.relative(srcDir, file).split(path.sep).join('/');

/**
 * Relative imports stay inside the top-level `src/<layer>` folder of the importing file. Imports of another layer use
 * `@/`, because the `layerBoundaries` patterns in `eslint.config.js` only see `@/` paths. Files straight in `src`
 * (main.ts, App.vue) belong to no layer, so the rule skips them.
 */
export const noRelativeLayerExit = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: [],
    messages: {
      leavesLayer:
        "Relative imports stay inside src/{{layer}}. Import '{{alias}}' instead, so the layer check sees it.",
      leavesSrc: 'Relative imports stay inside src/{{layer}}. Import files outside src through a package or an alias.',
    },
  },
  create(context) {
    const [layer, ...pathInLayer] = srcPath(context.filename).split('/');
    if (layer === '..' || pathInLayer.length === 0) {
      return {};
    }

    const checkImportSource = (node) => {
      // Skip package and `@/` imports, exports without a source, and dynamic imports of a computed path.
      const source = node.source;
      if (source?.type !== 'Literal' || !source.value.startsWith('.')) {
        return;
      }

      const target = srcPath(path.resolve(path.dirname(context.filename), source.value));
      if (target === layer || target.startsWith(`${layer}/`)) {
        return;
      }

      // A path to `src` itself or outside it has no `@/` form, so the rule reports it without a fix.
      if (target === '' || target.startsWith('..')) {
        context.report({ node: source, messageId: 'leavesSrc', data: { layer } });
        return;
      }

      const alias = `@/${target}`;
      const quote = source.raw[0];
      context.report({
        node: source,
        messageId: 'leavesLayer',
        data: { layer, alias },
        fix: (fixer) => fixer.replaceText(source, `${quote}${alias}${quote}`),
      });
    };

    return {
      ImportDeclaration: checkImportSource,
      ImportExpression: checkImportSource,
      ExportAllDeclaration: checkImportSource,
      ExportNamedDeclaration: checkImportSource,
    };
  },
};
