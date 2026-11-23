import type { Download } from '@/interfaces/api/models/Download';
import { useI18n } from 'vue-i18n';

import { CancelDownloadDialog } from '@/components/features/download/cancel-download-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DownloadStatus } from '@/enums/download/DownloadStatus';

/**
 * Cancels downloads through the cancel dialog, wherever a download shows: the dialog asks first and stays open
 * on a failure, and a done cancel gets its snackbar here.
 * @returns `cancel`.
 */
export const useDownloadCancel = () => {
  const dialog = useDialog();
  const { showSuccessSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /**
   * Asks before cancelling a download. A completed one is only removed from the list: its episodes have their videos.
   * @param download - The download.
   * @returns Whether it was cancelled, so the caller reads its data again.
   */
  const cancel = async (download: Download): Promise<boolean> => {
    const isCancelled = await dialog.showDialog<boolean, { download: Download }>({
      component: CancelDownloadDialog,
      props: { download },
    });

    if (isCancelled) {
      showSuccessSnackbar(
        download.status === DownloadStatus.Completed ? t('download.removed') : t('download.cancelled'),
      );
    }

    return Boolean(isCancelled);
  };

  return { cancel };
};
