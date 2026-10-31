import type { LocationQueryValue } from 'vue-router';

/**
 * Reads every string from a route query param, whether it appears once or repeated.
 * @param value - The route query param.
 * @returns The string values, without empty ones.
 */
export const getQueryStrings = (value: LocationQueryValue | LocationQueryValue[] | undefined): string[] => {
  const values = Array.isArray(value) ? value : [value];
  return values.filter((item): item is string => typeof item === 'string' && item !== '');
};
