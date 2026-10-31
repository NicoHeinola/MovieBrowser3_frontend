import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { Ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { websiteTagService } from '@/services/website/websiteTagService';

/**
 * Saves the tags a form only holds as pending (see `createPendingWebsiteTag`), so tags are only created once the
 * website using them is saved.
 *
 * @returns `createPendingTags`.
 */
export const useCreatePendingWebsiteTags = () => {
  const queryClient = useQueryClient();

  /**
   * Creates every selected pending tag and swaps its temporary id for the saved one. Unselected pending tags are
   * dropped. When some creations fail, the successful ones are still swapped in, so a retry does not create them
   * twice, and the first failure is rethrown.
   * @param tagIds - Selected tag ids, pending ones included. Updated in place.
   * @param pendingTags - The pending tags. Updated in place.
   * @returns Nothing.
   */
  const createPendingTags = async (tagIds: Ref<number[]>, pendingTags: Ref<WebsiteTag[]>): Promise<void> => {
    const selectedPendingTags = pendingTags.value.filter((tag) => tagIds.value.includes(tag.id));
    const results = await Promise.allSettled(
      selectedPendingTags.map((tag) => websiteTagService.create({ name: tag.name })),
    );
    const createdIds = new Map<number, number>();
    let failure: unknown = null;

    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        createdIds.set(selectedPendingTags[index].id, result.value.id);
      } else {
        failure ??= result.reason;
      }
    }

    if (createdIds.size > 0) {
      /** Reload the tag lists before swapping in the new ids, so the chips find the tags by name instead of by id. */
      await Promise.all(
        Object.values(WebsiteTagQueryKey).map((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
      );
    }

    tagIds.value = tagIds.value.map((tagId) => createdIds.get(tagId) ?? tagId);
    pendingTags.value = selectedPendingTags.filter((tag) => !createdIds.has(tag.id));

    if (failure) {
      throw failure;
    }
  };

  return {
    createPendingTags,
  };
};
