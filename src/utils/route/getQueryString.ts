import type { LocationQueryValue } from 'vue-router';

/**
 * Reads a single string from a route query param, taking the first value when it is repeated.
 * @param value - The route query param.
 * @returns The first string value, or undefined when there is none.
 */
export const getQueryString = (value: LocationQueryValue | LocationQueryValue[] | undefined): string | undefined => {
  const values = Array.isArray(value) ? value : [value];
  return values.find((item): item is string => typeof item === 'string');
};
