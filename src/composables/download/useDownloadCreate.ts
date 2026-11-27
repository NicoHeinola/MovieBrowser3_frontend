import type { CreateDownloadRequest } from '@/interfaces/api/requests/CreateDownloadRequest';
import type { ApiErrorResponse } from '@/interfaces/api/responses/ApiErrorResponse';
import { isAxiosError } from 'axios';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { downloadService } from '@/services/download/downloadService';
import { isApiErrorCode } from '@/utils/api/isApiErrorCode';

import { useDownloadRetry } from './useDownloadRetry';

/**
 * Reads which download a torrent already is from the backend's refusal to add it again.
 * @param error - What adding it failed with.
 * @returns The download's id, or null when it failed for another reason.
 */
const getExistingDownloadId = (error: unknown): number | null => {
  if (!isApiErrorCode(error, ApiErrorCode.DownloadExists) || !isAxiosError<ApiErrorResponse>(error)) {
    return null;
  }

  return Number(error.response?.data?.params?.download_id);
};

/**
 * Hands torrents to qBittorrent. A torrent that was added before is checked again instead. A failure shows in a
 * snackbar, and the calling dialog stays open to try again.
 * @returns Whether a torrent is being added, and `createDownload`.
 */
export const useDownloadCreate = () => {
  const isCreating = ref<boolean>(false);

  const { showAPIErrorSnackbar } = useCommonSnackbar();
  const { retryDownload } = useDownloadRetry();
  const { t } = useI18n();

  /**
   * Hands a torrent to qBittorrent. A torrent that already is a download carries on with that download.
   * @param request - The torrent.
   * @returns The download's id, or null when it failed.
   */
  const createDownload = async (request: CreateDownloadRequest): Promise<number | null> => {
    isCreating.value = true;

    try {
      const download = await downloadService.create(request);

      return download.id;
    } catch (error: unknown) {
      const existingDownloadId = getExistingDownloadId(error);

      if (existingDownloadId === null) {
        showAPIErrorSnackbar(error);
        return null;
      }

      // A failure only shows in a snackbar: the download is there to look at either way
      await retryDownload(existingDownloadId, t('download.restarted'));
      return existingDownloadId;
    } finally {
      isCreating.value = false;
    }
  };

  return {
    isCreating,
    createDownload,
  };
};
