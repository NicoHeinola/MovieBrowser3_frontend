import type { LocationQueryValue } from 'vue-router';

import { getQueryString } from './getQueryString';

/**
 * Reads a single non-negative whole number from a route query param.
 * @param value - The route query param.
 * @returns The number, or null when the param is missing, empty or not a whole number.
 */
export const getQueryNumber = (value: LocationQueryValue | LocationQueryValue[] | undefined): number | null => {
  const text = getQueryString(value)?.trim();

  // A strict digits check rejects values `Number` would accept, such as `1e3` or `0x10`.
  return text && /^\d+$/.test(text) ? Number(text) : null;
};
