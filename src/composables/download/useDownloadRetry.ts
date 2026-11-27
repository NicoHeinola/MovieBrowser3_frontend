import { useQueryClient } from '@tanstack/vue-query';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { downloadService } from '@/services/download/downloadService';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';

/**
 * Checks downloads again, wherever one shows: the backend finds which files are there, and missing files start again.
 * @returns `retryDownload`.
 */
export const useDownloadRetry = () => {
  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();

  /**
   * Checks a download again and says so. Then it refreshes the downloads on screen: nothing polls a failed download, so
   * it would still show as failed.
   * @param id - The download's id.
   * @param successMessage - What the snackbar says once it started.
   * @returns Nothing.
   */
  const retryDownload = async (id: number, successMessage: string): Promise<void> => {
    try {
      await downloadService.retry(id);
      showSuccessSnackbar(successMessage);
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
      return;
    }

    void queryClient.invalidateQueries(getQueryKeyFilter(DownloadQueryKey));
  };

  return { retryDownload };
};
