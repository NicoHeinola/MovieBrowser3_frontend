import type { ShowTemplate } from '@/interfaces/api/models/ShowTemplate';

import { ref } from 'vue';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showTemplateService } from '@/services/show/showTemplateService';

/**
 * Loads show templates from page links, for the new-show editor and its link dialog.
 * @returns `isLoading` and `loadTemplate`, which shows a failed load in a snackbar and gives null for it.
 */
export const useShowTemplate = () => {
  const isLoading = ref<boolean>(false);

  const { showAPIErrorSnackbar } = useCommonSnackbar();

  /**
   * Loads the show behind a page link.
   * @param url - The page's address.
   * @returns The template, or null when it couldn't be loaded.
   */
  const loadTemplate = async (url: string): Promise<ShowTemplate | null> => {
    isLoading.value = true;

    try {
      return await showTemplateService.get(url.trim());
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);

      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, loadTemplate };
};
