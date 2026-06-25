/**
 * Options for object change detection.
 *
 * `include` / `includes` define the paths that should be compared.
 * If omitted, all paths are compared.
 *
 * `exclude` / `excludes` disable comparison for matching paths.
 */
export type ObjectChangeCheckOptions = {
  include?: string[];
  includes?: string[];
  exclude?: string[];
  excludes?: string[];
};

// Normalize path patterns by trimming whitespace and removing empty entries.
const normalizePaths = (paths?: string[]): string[] => paths?.map((path) => path.trim()).filter(Boolean) ?? [];

// Build normalized patterns for include/exclude comparison.
const buildPathMatchers = (paths?: string[] | undefined): string[] => normalizePaths(paths);

// Check whether a path matches any of the provided include/exclude patterns.
const pathMatches = (path: string, patterns: string[]): boolean =>
  patterns.some((pattern) => pattern === path || pattern.startsWith(`${path}.`) || path.startsWith(`${pattern}.`));

// Decide whether a given property path should be compared.
const shouldComparePath = (path: string, includePatterns: string[], excludePatterns: string[]): boolean => {
  // Excluded paths always take precedence.
  if (excludePatterns.length > 0 && pathMatches(path, excludePatterns)) {
    return false;
  }

  // If no include list is defined, compare everything that is not excluded.
  if (includePatterns.length === 0) {
    return true;
  }

  // Root-level comparison remains enabled when include patterns exist.
  if (path === '') {
    return true;
  }

  return pathMatches(path, includePatterns);
};

// Convert provided option aliases into normalized pattern arrays.
const getCombinedPatterns = (options: ObjectChangeCheckOptions) => ({
  include: buildPathMatchers(options.include ?? options.includes),
  exclude: buildPathMatchers(options.exclude ?? options.excludes),
});

const getChangedObjectRecursive = (
  original: unknown,
  changed: unknown,
  includePatterns: string[],
  excludePatterns: string[],
  path = '',
): unknown | undefined => {
  if (!shouldComparePath(path, includePatterns, excludePatterns)) {
    return undefined;
  }

  if (Object.is(original, changed)) {
    return undefined;
  }

  if (typeof original !== typeof changed) {
    return changed;
  }

  if (original === null || changed === null || typeof original !== 'object') {
    return changed;
  }

  if (Array.isArray(original) !== Array.isArray(changed)) {
    return changed;
  }

  if (Array.isArray(original) && Array.isArray(changed)) {
    if (original.length !== changed.length) {
      return changed;
    }

    for (const [index, originalItem] of original.entries()) {
      const childPath = path ? `${path}.${index}` : `${index}`;
      const nestedChange = getChangedObjectRecursive(
        originalItem,
        changed[index],
        includePatterns,
        excludePatterns,
        childPath,
      );

      if (nestedChange !== undefined) {
        return changed;
      }
    }

    return undefined;
  }

  const originalKeys = Object.keys(original as Record<string, unknown>);
  const changedKeys = Object.keys(changed as Record<string, unknown>);
  const keys = new Set([...originalKeys, ...changedKeys]);
  const diff: Record<string, unknown> = {};

  for (const key of keys) {
    const childPath = path ? `${path}.${key}` : key;
    if (!shouldComparePath(childPath, includePatterns, excludePatterns)) {
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(original, key) || !Object.prototype.hasOwnProperty.call(changed, key)) {
      diff[key] = (changed as Record<string, unknown>)[key];
      continue;
    }

    const nestedChange = getChangedObjectRecursive(
      (original as Record<string, unknown>)[key],
      (changed as Record<string, unknown>)[key],
      includePatterns,
      excludePatterns,
      childPath,
    );

    if (nestedChange !== undefined) {
      diff[key] = nestedChange;
    }
  }

  return Object.keys(diff).length > 0 ? diff : undefined;
};

/**
 * Return a partial object representing only the changed values.
 *
 * The returned object contains nested diffs for changed properties.
 * If there are no changes, `undefined` is returned.
 */
export const getChangedObject = <T>(
  original: T,
  changed: T,
  options: ObjectChangeCheckOptions = {},
): Partial<T> | undefined => {
  const { include, exclude } = getCombinedPatterns(options);
  return getChangedObjectRecursive(original, changed, include, exclude, '') as Partial<T> | undefined;
};
