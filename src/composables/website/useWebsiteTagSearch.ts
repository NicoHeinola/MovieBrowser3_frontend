import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';

import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { websiteTagService } from '@/services/website/websiteTagService';
import { createSearchFilters } from '@/utils/filter/createSearchFilters';

/**
 * Debounced, paginated tag search for the admin websites page's tags tab. It has no filters, and stays out of the URL,
 * which the websites tab's search keeps.
 *
 * @returns The search input, sort and page refs, the query, the page count and the tags.
 */
export const useWebsiteTagSearch = () => {
  const filterOptions = createSearchFilters<Record<string, never>>([], 'search');

  const { items, ...search } = usePaginatedSearch<WebsiteTag, Record<string, never>>({
    queryKey: WebsiteTagQueryKey.AdminWebsiteTags,
    list: websiteTagService.list,
    createEmptyFilters: filterOptions.createEmptyFilters,
    getFilterParams: filterOptions.getFilterParams,
    countActiveFilters: filterOptions.countActiveFilters,
    defaultSort: 'name',
    pageSize: 50,
  });

  return {
    ...search,
    tags: items,
  };
};
