import type { Download } from '@/interfaces/api/models/Download';
import { useQueryClient } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import { CancelDownloadDialog } from '@/components/features/download/cancel-download-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { isDownloadCompleted } from '@/utils/download/isDownloadCompleted';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';

/**
 * Cancels downloads through the cancel dialog, wherever a download shows: the dialog asks first and stays open
 * on a failure, and a done cancel gets its snackbar here.
 * @returns `cancelDownload`.
 */
export const useDownloadCancel = () => {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const { showSuccessSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /**
   * Asks before cancelling a download. A completed one is only removed from the list: its episodes have their videos.
   * @param download - The download.
   * @returns Whether it was cancelled. The list of downloads is read again here. The show editor uses the answer to
   * stop following the download.
   */
  const cancelDownload = async (download: Download): Promise<boolean> => {
    const isCancelled = await dialog.showDialog<boolean, { download: Download }>({
      component: CancelDownloadDialog,
      props: { download },
    });

    if (!isCancelled) {
      return false;
    }

    const isCompleted = isDownloadCompleted(download.status);
    const successMessage = isCompleted ? t('download.removed') : t('download.cancelled');

    showSuccessSnackbar(successMessage);

    // Only the list: the show editor's own query of this download would now get a 404
    await queryClient.invalidateQueries({ queryKey: [DownloadQueryKey.AdminDownloads] });

    // It can have removed episodes. Only marked stale: no page that cancels shows a list of shows, and the show editor
    // loads its show again itself
    await queryClient.invalidateQueries({ ...getQueryKeyFilter(ShowQueryKey), refetchType: 'none' });

    return true;
  };

  return { cancelDownload };
};
