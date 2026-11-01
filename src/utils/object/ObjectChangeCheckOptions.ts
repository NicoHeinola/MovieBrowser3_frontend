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
