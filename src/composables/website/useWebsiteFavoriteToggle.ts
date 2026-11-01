import type { Website } from '@/interfaces/api/models/Website';
import { useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { websiteService } from '@/services/website/websiteService';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { updateCachedObjects } from '@/utils/query/updateCachedObjects';

/**
 * Stars and unstars websites from the admin websites list without reloading it.
 * @returns `toggleFavorite` and the ids of the websites whose toggle is saving.
 */
export const useWebsiteFavoriteToggle = () => {
  const savingFavoriteIds = ref<number[]>([]);

  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar } = useCommonSnackbar();

  /**
   * Saves the flipped favorite flag and puts the saved website into every cached website list in place, so the grid
   * does not reload. The dashboard's favorites list is marked stale, since the website may join or leave it.
   * @param website - The website to toggle.
   * @returns Nothing.
   */
  const toggleFavorite = async (website: Website): Promise<void> => {
    savingFavoriteIds.value = [...savingFavoriteIds.value, website.id];

    try {
      const updatedWebsite = await websiteService.update(website.id, { is_favorite: !website.is_favorite });

      // Website tags share ids with websites but have no url, so they are never replaced.
      queryClient.setQueriesData(getQueryKeyFilter(WebsiteQueryKey), (data: unknown) =>
        updateCachedObjects(data, (record) =>
          record.id === updatedWebsite.id && typeof record.url === 'string' ? { ...updatedWebsite } : record,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: [WebsiteQueryKey.AdminDashboardWebsites] });
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    } finally {
      savingFavoriteIds.value = savingFavoriteIds.value.filter((id) => id !== website.id);
    }
  };

  return {
    savingFavoriteIds,
    toggleFavorite,
  };
};
