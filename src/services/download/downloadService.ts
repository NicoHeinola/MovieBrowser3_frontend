import type { Download } from '@/interfaces/api/models/Download';
import type { CreateDownloadRequest } from '@/interfaces/api/requests/CreateDownloadRequest';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Hands a torrent to qBittorrent, which holds it without downloading until files are picked.
 * @param request - The torrent.
 * @returns The new download.
 */
const create = async (request: CreateDownloadRequest): Promise<Download> => {
  // qBittorrent reads a `.torrent` link first, which can take a few seconds
  const response = await apiClient.post<Download>('downloads', request, { timeout: 30_000 });

  return response.data;
};

/**
 * Reads a download with its files and progress as qBittorrent reports them now.
 * @param id - The download's id.
 * @returns The download.
 */
const get = async (id: number): Promise<Download> => {
  const response = await apiClient.get<Download>(`downloads/${id}`);

  return response.data;
};

export const downloadService = {
  create,
  get,
};
