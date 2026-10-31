import type { WebsiteSearchFilters } from '@/composables/website/WebsiteSearchFilters';
import type { LocationQuery, LocationQueryValue } from 'vue-router';

import { getQueryStrings } from '@/utils/route/getQueryStrings';

/**
 * Reads tag ids from a query param, dropping values that are not positive integers.
 * @param value - The route query param.
 * @returns The tag ids.
 */
const getTagIds = (value: LocationQueryValue | LocationQueryValue[] | undefined): number[] =>
  getQueryStrings(value)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

/**
 * Reads the website search filters from URL query params.
 * @param query - The route query.
 * @returns The tag filters.
 */
export const getWebsiteSearchFiltersFromQuery = (query: LocationQuery): WebsiteSearchFilters => {
  return {
    tagIds: getTagIds(query.tag),
    excludedTagIds: getTagIds(query.exclude_tag),
  };
};
