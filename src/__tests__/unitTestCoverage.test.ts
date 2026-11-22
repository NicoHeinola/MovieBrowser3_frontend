import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/** The source of every utility and service module, keyed by its `/src/...` path. */
const sources = import.meta.glob<string>(
  ['/src/utils/**/*.ts', '/src/services/**/*.ts', '!**/__tests__/**', '!**/*.d.ts'],
  { query: '?raw', import: 'default', eager: true },
);

/** Every test of a utility or service. Only the paths are used, so the modules are never loaded. */
const testPaths = new Set<string>(
  Object.keys(import.meta.glob(['/src/utils/**/__tests__/*.test.ts', '/src/services/**/__tests__/*.test.ts'])),
);

/**
 * Tells whether a node or anything below it is a function, method or accessor.
 * @param node - The node to search.
 * @returns Whether a function-like node was found.
 */
const containsFunction = (node: ts.Node): boolean => {
  // Type annotations hold no code; a function type in one (`Record<K, () => void>`) is not a function to test
  if (ts.isTypeNode(node)) {
    return false;
  }

  // forEachChild stops at, and returns, the first truthy result
  return ts.isFunctionLike(node) || ts.forEachChild(node, (child) => containsFunction(child) || undefined) === true;
};

/**
 * Tells whether a module holds code worth testing: a function anywhere in its value statements. Type aliases and
 * interfaces are skipped, so function types in them don't count, and neither do constant tables.
 * @param path - The module's path, used as its file name.
 * @param source - The module's source.
 * @returns Whether the module declares a function.
 */
const hasFunction = (path: string, source: string): boolean => {
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest);

  return file.statements
    .filter((statement) => !ts.isTypeAliasDeclaration(statement) && !ts.isInterfaceDeclaration(statement))
    .some((statement) => containsFunction(statement));
};

/**
 * Names the test a module needs: `__tests__/<name>.test.ts` next to it.
 * @param path - The module's `/src/...` path.
 * @returns The test's path.
 */
const getTestPath = (path: string): string => path.replace(/\/([^/]+)\.ts$/, '/__tests__/$1.test.ts');

describe('unit test coverage', () => {
  it('has a test for every utility and service that declares a function', () => {
    const untested = Object.entries(sources)
      .filter(([path, source]) => hasFunction(path, source) && !testPaths.has(getTestPath(path)))
      .map(([path]) => path)
      .toSorted();

    expect(untested).toEqual([]);
  });
});
