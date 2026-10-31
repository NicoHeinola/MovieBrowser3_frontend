import type { ShowSearchFilters } from '@/composables/show/ShowSearchFilters';
import type { LocationQuery } from 'vue-router';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getQueryString } from '@/utils/route/getQueryString';
import { getQueryStrings } from '@/utils/route/getQueryStrings';

const watchStatuses: string[] = Object.values(WatchStatus);

/**
 * Checks whether a query value is a known watch status.
 * @param value - The query value.
 * @returns Whether the value is a watch status.
 */
const isWatchStatus = (value: string): value is WatchStatus => watchStatuses.includes(value);

/**
 * Reads the show search filters from URL query params, dropping unknown watch statuses.
 * @param query - The route query.
 * @returns The search filters.
 */
export const getShowSearchFiltersFromQuery = (query: LocationQuery): ShowSearchFilters => {
  return {
    categories: getQueryStrings(query.category),
    excludedCategories: getQueryStrings(query.exclude_category),
    watchStatuses: getQueryStrings(query.watch_status).filter(isWatchStatus),
    excludedWatchStatuses: getQueryStrings(query.exclude_watch_status).filter(isWatchStatus),
    hasPreview: getQueryString(query.has_preview) === 'true',
  };
};
