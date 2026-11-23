import type { CreateDownloadRequest } from '@/interfaces/api/requests/CreateDownloadRequest';
import type { ApiErrorResponse } from '@/interfaces/api/responses/ApiErrorResponse';
import { isAxiosError } from 'axios';
import { ref } from 'vue';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { downloadService } from '@/services/download/downloadService';
import { getApiErrorMessage } from '@/utils/api/getApiErrorMessage';
import { isApiErrorCode } from '@/utils/api/isApiErrorCode';

/**
 * Hands torrents to qBittorrent for a dialog that stays open on failure, so its error shows in place instead of in a
 * snackbar after the dialog is gone.
 * @returns Whether a torrent is being added, why the last one failed (or null), and `create`.
 */
export const useDownloadCreate = () => {
  const isCreating = ref<boolean>(false);
  const errorMessage = ref<string | null>(null);

  /**
   * Hands a torrent to qBittorrent. A torrent that already is a download carries on with that download.
   * @param request - The torrent.
   * @returns The download's id, or null when it failed and `errorMessage` says why.
   */
  const create = async (request: CreateDownloadRequest): Promise<number | null> => {
    isCreating.value = true;
    errorMessage.value = null;

    try {
      return (await downloadService.create(request)).id;
    } catch (error: unknown) {
      if (isApiErrorCode(error, ApiErrorCode.DownloadExists) && isAxiosError<ApiErrorResponse>(error)) {
        return Number(error.response?.data?.params?.download_id);
      }

      errorMessage.value = getApiErrorMessage(error);
      return null;
    } finally {
      isCreating.value = false;
    }
  };

  return {
    isCreating,
    errorMessage,
    create,
  };
};
