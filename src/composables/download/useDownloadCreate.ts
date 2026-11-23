import type { CreateDownloadRequest } from '@/interfaces/api/requests/CreateDownloadRequest';
import type { ApiErrorResponse } from '@/interfaces/api/responses/ApiErrorResponse';
import { isAxiosError } from 'axios';
import { ref } from 'vue';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { downloadService } from '@/services/download/downloadService';
import { isApiErrorCode } from '@/utils/api/isApiErrorCode';

/**
 * Hands torrents to qBittorrent. A failure shows in a snackbar, and the calling dialog stays open to try again.
 * @returns Whether a torrent is being added, and `create`.
 */
export const useDownloadCreate = () => {
  const isCreating = ref<boolean>(false);

  const { showAPIErrorSnackbar } = useCommonSnackbar();

  /**
   * Hands a torrent to qBittorrent. A torrent that already is a download carries on with that download.
   * @param request - The torrent.
   * @returns The download's id, or null when it failed.
   */
  const create = async (request: CreateDownloadRequest): Promise<number | null> => {
    isCreating.value = true;

    try {
      return (await downloadService.create(request)).id;
    } catch (error: unknown) {
      if (isApiErrorCode(error, ApiErrorCode.DownloadExists) && isAxiosError<ApiErrorResponse>(error)) {
        return Number(error.response?.data?.params?.download_id);
      }

      showAPIErrorSnackbar(error);
      return null;
    } finally {
      isCreating.value = false;
    }
  };

  return {
    isCreating,
    create,
  };
};
