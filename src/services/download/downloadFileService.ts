import type { Download } from '@/interfaces/api/models/Download';
import type { UpdateDownloadFilesRequest } from '@/interfaces/api/requests/UpdateDownloadFilesRequest';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Replaces which files of a download become which episodes, and starts the torrent on them.
 * @param downloadId - The download's id.
 * @param request - Every picked file with its episode.
 * @returns The download.
 */
const update = async (downloadId: number, request: UpdateDownloadFilesRequest): Promise<Download> => {
  const response = await apiClient.put<Download>(`downloads/${downloadId}/files`, request);

  return response.data;
};

export const downloadFileService = {
  update,
};
