import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';
import type { SearchFilterDefinition } from '@/composables/search/SearchFilterDefinition';
import type { SearchFilterValue } from '@/composables/search/SearchFilterValue';
import type { LocationQuery, LocationQueryRaw } from 'vue-router';

import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { getQueryString } from '@/utils/route/getQueryString';
import { getQueryStrings } from '@/utils/route/getQueryStrings';

/**
 * Checks whether two lists hold the same values, in any order.
 * @param values - The first list.
 * @param otherValues - The second list.
 * @returns Whether the lists match.
 */
const hasSameValues = (values: string[], otherValues: string[]): boolean =>
  values.length === otherValues.length && values.every((value) => otherValues.includes(value));

/**
 * Writes one filter as URL query params.
 * @param definition - The filter.
 * @param value - The filter's value.
 * @param defaultValue - The filter's default value.
 * @returns The query params, empty when the value equals the default.
 */
const write = (
  definition: SearchFilterDefinition,
  value: SearchFilterValue,
  defaultValue: SearchFilterValue,
): LocationQueryRaw => {
  const { param } = definition;

  if (definition.type === SearchFilterType.Switch) {
    return value === defaultValue ? {} : { [param]: String(value) };
  }

  const { included, excluded } = value as ChipsFilterValue;
  const defaults = defaultValue as ChipsFilterValue;

  if (hasSameValues(included, defaults.included) && hasSameValues(excluded, defaults.excluded)) {
    return {};
  }

  // An empty param keeps a cleared default cleared, because a missing param means the default.
  if (included.length === 0 && excluded.length === 0) {
    return { [param]: '' };
  }

  return {
    ...(included.length > 0 && { [param]: included }),
    ...(excluded.length > 0 && { [`exclude_${param}`]: excluded }),
  };
};

/**
 * Reads one filter from URL query params.
 * @param definition - The filter.
 * @param query - The route query.
 * @param defaultValue - The filter's default value.
 * @returns The filter's value.
 */
const read = (
  definition: SearchFilterDefinition,
  query: LocationQuery,
  defaultValue: SearchFilterValue,
): SearchFilterValue => {
  const { param } = definition;

  if (definition.type === SearchFilterType.Switch) {
    const value = getQueryString(query[param]);
    return value === undefined ? defaultValue : value === 'true';
  }

  const excludeParam = `exclude_${param}`;

  // Either param means the URL holds the whole filter. With neither, the user has not changed it.
  if (!(param in query) && !(excludeParam in query)) {
    return defaultValue;
  }

  return { included: getQueryStrings(query[param]), excluded: getQueryStrings(query[excludeParam]) };
};

/** Reads and writes one search filter in the URL query. */
export const searchFilterQuery = {
  write,
  read,
};
