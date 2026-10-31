import type { WebsiteSearchFilters } from './WebsiteSearchFilters';
import type { Website } from '@/interfaces/api/models/Website';

import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { websiteService } from '@/services/website/websiteService';
import { toggleFilterValue } from '@/utils/filter/toggleFilterValue';
import { getWebsiteSearchFilterParams } from '@/utils/website/getWebsiteSearchFilterParams';
import { websiteSortOptions } from './websiteSortOptions';

/**
 * Debounced, paginated website search for the admin websites page.
 *
 * @returns The search input, filter, sort and page refs, the query, the websites, and `toggleTag`.
 */
export const useWebsiteSearch = () => {
  const { items, filters, ...search } = usePaginatedSearch<Website, WebsiteSearchFilters>({
    queryKey: WebsiteQueryKey.AdminWebsites,
    list: websiteService.list,
    createEmptyFilters: () => ({ tagIds: [], excludedTagIds: [] }),
    getFilterParams: getWebsiteSearchFilterParams,
    countActiveFilters: (currentFilters) => currentFilters.tagIds.length + currentFilters.excludedTagIds.length,
    defaultSort: websiteSortOptions[0].value,
    pageSize: 24,
  });

  /**
   * Includes a tag in the filter, or stops including it. Cards are the caller, and a shown card never has an excluded
   * tag, so excluded tags are left alone.
   * @param tagId - The tag id.
   * @returns void
   */
  const toggleTag = (tagId: number): void => {
    filters.value = {
      ...filters.value,
      tagIds: toggleFilterValue(filters.value.tagIds, tagId, !filters.value.tagIds.includes(tagId)),
    };
  };

  return {
    ...search,
    filters,
    toggleTag,
    websites: items,
  };
};
