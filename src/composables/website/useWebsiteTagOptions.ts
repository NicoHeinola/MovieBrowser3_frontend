import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { computed } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { websiteTagService } from '@/services/website/websiteTagService';

/**
 * Provides a chip for every website tag, with its website count when the backend sends one.
 * @returns The options and their loading state.
 */
export const useWebsiteTagOptions = () => {
  const tagsQuery = useAPIQuery<PaginatedResponse<WebsiteTag>>({
    queryKey: [WebsiteTagQueryKey.WebsiteFilterTags],
    queryFn: async () => {
      return await websiteTagService.list({
        sort: 'name',
        page: { number: 0, size: 0 },
      });
    },
    placeholderData: (previousData) => previousData,
  });

  return {
    options: computed(() =>
      (tagsQuery.data.value?.data ?? []).map((tag) => ({
        value: String(tag.id),
        text: tag.websites_count === undefined ? tag.name : `${tag.name} (${tag.websites_count})`,
      })),
    ),
    isPending: tagsQuery.isPending,
  };
};
