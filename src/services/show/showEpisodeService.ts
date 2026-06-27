import type { Episode } from '@/interfaces/api/models/Episode';
import type { CreateEpisodeRequest } from '@/interfaces/api/requests/CreateEpisodeRequest';
import type { UpdateEpisodeRequest } from '@/interfaces/api/requests/UpdateEpisodeRequest';

import { apiClient } from '@/plugins/api/apiClient';
import { toFormData } from '@/utils/object/toFormData';

const list = async (entryId: number): Promise<Episode[]> => {
  const response = await apiClient.get<Episode[]>(`show-entries/${entryId}/episodes`);

  return response.data;
};

const get = async (episodeId: number): Promise<Episode> => {
  const response = await apiClient.get<Episode>(`episodes/${episodeId}`);

  return response.data;
};

const create = async (entryId: number, request: CreateEpisodeRequest): Promise<Episode> => {
  const formData = toFormData(request);

  const response = await apiClient.post<Episode>(`show-entries/${entryId}/episodes`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300_000, // 5 minutes
  });

  return response.data;
};

const update = async (episodeId: number, request: UpdateEpisodeRequest): Promise<Episode> => {
  const formData = toFormData(request);

  const response = await apiClient.put<Episode>(`episodes/${episodeId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300_000, // 5 minutes
  });

  return response.data;
};

const remove = async (episodeId: number): Promise<void> => {
  await apiClient.delete(`episodes/${episodeId}`);
};

export const showEpisodeService = {
  list,
  get,
  create,
  update,
  remove,
};
