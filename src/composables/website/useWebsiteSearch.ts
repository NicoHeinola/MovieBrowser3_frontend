import type { WebsiteSearchFilters } from './WebsiteSearchFilters';
import type { Website } from '@/interfaces/api/models/Website';

import { computed } from 'vue';
import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { websiteService } from '@/services/website/websiteService';
import { createSearchFilters } from '@/utils/filter/createSearchFilters';
import { toggleFilterValue } from '@/utils/filter/toggleFilterValue';
import { websiteSearchFilterDefinitions } from './websiteSearchFilterDefinitions';
import { websiteSortOptions } from './websiteSortOptions';

/**
 * Debounced, paginated website search for the admin websites page, kept in the URL query.
 *
 * @returns The search input, filter, sort and page refs, the query, the websites, `includedTagIds`, `toggleTag` and
 * `showOnlyTag`.
 */
export const useWebsiteSearch = () => {
  const { routeQuery, ...filterOptions } = createSearchFilters<WebsiteSearchFilters>(
    websiteSearchFilterDefinitions,
    'search',
  );

  const { items, filters, ...search } = usePaginatedSearch<Website, WebsiteSearchFilters>({
    queryKey: WebsiteQueryKey.AdminWebsites,
    list: websiteService.list,
    ...filterOptions,
    defaultSort: websiteSortOptions[0].value,
    pageSize: 24,
    routeQuery: {
      ...routeQuery,
      sortValues: websiteSortOptions.map((option) => option.value),
    },
  });

  const includedTagIds = computed<number[]>(() => filters.value.tag.included.map(Number));

  /**
   * Includes a tag in the filter, or stops including it. Cards are the caller, and a shown card never has an excluded
   * tag, so excluded tags are left alone.
   * @param tagId - The tag id.
   * @returns void
   */
  const toggleTag = (tagId: number): void => {
    const { included, excluded } = filters.value.tag;
    const value = String(tagId);

    filters.value = { tag: { included: toggleFilterValue(included, value, !included.includes(value)), excluded } };
  };

  /**
   * Filters on a single tag, replacing every other tag filter.
   * @param tagId - The tag id.
   * @returns void
   */
  const showOnlyTag = (tagId: number): void => {
    filters.value = { tag: { included: [String(tagId)], excluded: [] } };
  };

  return {
    ...search,
    filters,
    includedTagIds,
    toggleTag,
    showOnlyTag,
    websites: items,
  };
};
