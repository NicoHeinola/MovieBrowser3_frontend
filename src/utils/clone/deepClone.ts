/**
 * Deep clone plain data via a JSON round-trip.
 * `structuredClone` is not used because it throws on Vue reactive proxies.
 * Functions, `undefined` values and `File`/`Blob` instances do not survive the clone.
 *
 * @param obj The value to clone.
 * @returns A deep copy of the value.
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === undefined) {
    return obj;
  }

  // eslint-disable-next-line unicorn/prefer-structured-clone -- structuredClone throws on Vue reactive proxies
  return JSON.parse(JSON.stringify(obj)) as T;
};
