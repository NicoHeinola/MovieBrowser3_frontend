import type { Website } from '@/interfaces/api/models/Website';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { websiteService } from '@/services/website/websiteService';

/**
 * Stars and unstars websites from the admin websites list without reloading it.
 * @returns `toggleFavorite` and the ids of the websites whose toggle is saving.
 */
export const useWebsiteFavoriteToggle = () => {
  const savingFavoriteIds = ref<number[]>([]);

  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar } = useCommonSnackbar();

  /**
   * Saves the flipped favorite flag and puts the saved website into the cached list in place, so the grid does not
   * reload. The dashboard's favorites list is marked stale.
   * @param website - The website to toggle.
   * @returns Nothing.
   */
  const toggleFavorite = async (website: Website): Promise<void> => {
    savingFavoriteIds.value = [...savingFavoriteIds.value, website.id];

    try {
      const updatedWebsite = await websiteService.update(website.id, { is_favorite: !website.is_favorite });

      queryClient.setQueriesData<PaginatedResponse<Website>>({ queryKey: [WebsiteQueryKey.AdminWebsites] }, (data) =>
        data
          ? { ...data, data: data.data.map((item) => (item.id === updatedWebsite.id ? updatedWebsite : item)) }
          : data,
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
