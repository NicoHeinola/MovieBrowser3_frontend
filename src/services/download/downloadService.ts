import type { Download } from '@/interfaces/api/models/Download';
import type { CreateDownloadRequest } from '@/interfaces/api/requests/CreateDownloadRequest';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Lists every download, newest first, with its progress as qBittorrent reports it now.
 * @returns The downloads.
 */
const list = async (): Promise<Download[]> => {
  const response = await apiClient.get<Download[]>('downloads');

  return response.data;
};

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

/**
 * Cancels a download: removes the torrent and what it downloaded from qBittorrent.
 * @param id - The download's id.
 * @param shouldRemoveEpisodes - Also remove the episodes made for it that still wait for their file.
 * @returns Nothing.
 */
const remove = async (id: number, shouldRemoveEpisodes: boolean): Promise<void> => {
  await apiClient.delete(`downloads/${id}`, { params: { remove_episodes: Number(shouldRemoveEpisodes) } });
};

/**
 * Checks a download again: the backend finds which of its files are really there. Missing files start again within a
 * minute.
 * @param id - The download's id.
 * @returns Nothing.
 */
const retry = async (id: number): Promise<void> => {
  await apiClient.post(`downloads/${id}/retry`);
};

export const downloadService = {
  list,
  create,
  get,
  remove,
  retry,
};
