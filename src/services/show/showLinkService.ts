import type { ShowLink } from '@/interfaces/api/models/ShowLink';
import type { CreateShowLinkRequest } from '@/interfaces/api/requests/CreateShowLinkRequest';
import type { UpdateShowLinkRequest } from '@/interfaces/api/requests/UpdateShowLinkRequest';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (showId: number): Promise<ShowLink[]> => {
  const response = await apiClient.get<ShowLink[]>(`shows/${showId}/links`);

  return response.data;
};

const get = async (linkId: number): Promise<ShowLink> => {
  const response = await apiClient.get<ShowLink>(`links/${linkId}`);

  return response.data;
};

const create = async (showId: number, request: CreateShowLinkRequest): Promise<ShowLink> => {
  const response = await apiClient.post<ShowLink>(`shows/${showId}/links`, request);

  return response.data;
};

const update = async (linkId: number, request: UpdateShowLinkRequest): Promise<ShowLink> => {
  const response = await apiClient.put<ShowLink>(`links/${linkId}`, request);

  return response.data;
};

const deleteLink = async (linkId: number): Promise<void> => {
  await apiClient.delete(`links/${linkId}`);
};

export const showLinkService = {
  list,
  get,
  create,
  update,
  deleteLink,
};
