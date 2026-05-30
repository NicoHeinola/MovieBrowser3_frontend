import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { CreateShowEntryRequest } from '@/interfaces/api/requests/CreateShowEntryRequest';
import type { UpdateShowEntryRequest } from '@/interfaces/api/requests/UpdateShowEntryRequest';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (showId: number): Promise<ShowEntry[]> => {
  const response = await apiClient.get<ShowEntry[]>(`shows/${showId}/entries`);

  return response.data;
};

const get = async (entryId: number): Promise<ShowEntry> => {
  const response = await apiClient.get<ShowEntry>(`entries/${entryId}`);

  return response.data;
};

const create = async (showId: number, request: CreateShowEntryRequest): Promise<ShowEntry> => {
  const response = await apiClient.post<ShowEntry>(`shows/${showId}/entries`, request);

  return response.data;
};

const update = async (entryId: number, request: UpdateShowEntryRequest): Promise<ShowEntry> => {
  const response = await apiClient.put<ShowEntry>(`entries/${entryId}`, request);

  return response.data;
};

const deleteEntry = async (entryId: number): Promise<void> => {
  await apiClient.delete(`entries/${entryId}`);
};

export const showEntryService = {
  list,
  get,
  create,
  update,
  deleteEntry,
};
