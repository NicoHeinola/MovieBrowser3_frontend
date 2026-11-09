/**
 * Sort files by name in natural order, so `Episode 2` comes before `Episode 10`.
 *
 * @param files The files to sort.
 * @returns A new array, ordered by file name.
 */
export const sortFilesByName = <T extends Pick<File, 'name'>>(files: T[]): T[] => {
  return files.toSorted((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
};
