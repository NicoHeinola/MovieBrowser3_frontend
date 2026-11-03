/**
 * Splits a version such as `1.2.3` or `v1.2.3` into its numbers. Releases are plain `vX.Y.Z` tags, without
 * pre-releases.
 * @param version - The version to split.
 * @returns The `major.minor.patch` numbers, with missing or non-numeric parts as `0`.
 */
const parseVersion = (version: string): number[] => {
  const numbers: number[] = version
    .trim()
    .replace(/^v/i, '')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);

  // Pad to three parts so `1.2` compares equal to `1.2.0`.
  while (numbers.length < 3) {
    numbers.push(0);
  }

  return numbers;
};

/**
 * Compares two semantic versions.
 * @param a - The first version.
 * @param b - The second version.
 * @returns A negative number when `a` is older, a positive one when it is newer, and `0` when they are equal.
 */
export const compareVersions = (a: string, b: string): number => {
  const numbersA = parseVersion(a);
  const numbersB = parseVersion(b);
  const length = Math.max(numbersA.length, numbersB.length);

  for (let index = 0; index < length; index++) {
    const difference = (numbersA[index] ?? 0) - (numbersB[index] ?? 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
};
