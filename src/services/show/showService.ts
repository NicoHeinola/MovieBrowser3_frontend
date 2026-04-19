import type { Episode } from '@/interfaces/api/models/Episode';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { ShowLink } from '@/interfaces/api/models/ShowLink';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateEpisodeRequest } from '@/interfaces/api/requests/CreateEpisodeRequest';
import type { CreateShowEntryRequest } from '@/interfaces/api/requests/CreateShowEntryRequest';
import type { CreateShowLinkRequest } from '@/interfaces/api/requests/CreateShowLinkRequest';
import type { CreateShowRequest } from '@/interfaces/api/requests/CreateShowRequest';
import type { UpdateEpisodeRequest } from '@/interfaces/api/requests/UpdateEpisodeRequest';
import type { UpdateShowEntryRequest } from '@/interfaces/api/requests/UpdateShowEntryRequest';
import type { UpdateShowLinkRequest } from '@/interfaces/api/requests/UpdateShowLinkRequest';
import type { UpdateShowRequest } from '@/interfaces/api/requests/UpdateShowRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<PaginatedResponse<Show>> => {
  const response = await apiClient.get<PaginatedResponse<Show>>('shows', {
    params: query,
  });

  return response.data;
};

const get = async (showId: number): Promise<Show> => {
  const response = await apiClient.get<Show>(`shows/${showId}`);

  return response.data;
};

const create = async (request: CreateShowRequest): Promise<Show> => {
  const response = await apiClient.post<Show>('shows', request);

  return response.data;
};

const update = async (showId: number, request: UpdateShowRequest): Promise<Show> => {
  const response = await apiClient.patch<Show>(`shows/${showId}`, request);

  return response.data;
};

const listEntries = async (showId: number): Promise<ShowEntry[]> => {
  const response = await apiClient.get<ShowEntry[]>(`shows/${showId}/entries`);

  return response.data;
};

const getEntry = async (entryId: number): Promise<ShowEntry> => {
  const response = await apiClient.get<ShowEntry>(`entries/${entryId}`);

  return response.data;
};

const createEntry = async (showId: number, request: CreateShowEntryRequest): Promise<ShowEntry> => {
  const response = await apiClient.post<ShowEntry>(`shows/${showId}/entries`, request);

  return response.data;
};

const updateEntry = async (entryId: number, request: UpdateShowEntryRequest): Promise<ShowEntry> => {
  const response = await apiClient.put<ShowEntry>(`entries/${entryId}`, request);

  return response.data;
};

const deleteEntry = async (entryId: number): Promise<void> => {
  await apiClient.delete(`entries/${entryId}`);
};

const listEpisodes = async (entryId: number): Promise<Episode[]> => {
  const response = await apiClient.get<Episode[]>(`show-entries/${entryId}/episodes`);

  return response.data;
};

const getEpisode = async (episodeId: number): Promise<Episode> => {
  const response = await apiClient.get<Episode>(`episodes/${episodeId}`);

  return response.data;
};

const createEpisode = async (entryId: number, request: CreateEpisodeRequest): Promise<Episode> => {
  const response = await apiClient.post<Episode>(`show-entries/${entryId}/episodes`, request);

  return response.data;
};

const updateEpisode = async (episodeId: number, request: UpdateEpisodeRequest): Promise<Episode> => {
  const response = await apiClient.put<Episode>(`episodes/${episodeId}`, request);

  return response.data;
};

const deleteEpisode = async (episodeId: number): Promise<void> => {
  await apiClient.delete(`episodes/${episodeId}`);
};

const listLinks = async (showId: number): Promise<ShowLink[]> => {
  const response = await apiClient.get<ShowLink[]>(`shows/${showId}/links`);

  return response.data;
};

const getLink = async (linkId: number): Promise<ShowLink> => {
  const response = await apiClient.get<ShowLink>(`links/${linkId}`);

  return response.data;
};

const createLink = async (showId: number, request: CreateShowLinkRequest): Promise<ShowLink> => {
  const response = await apiClient.post<ShowLink>(`shows/${showId}/links`, request);

  return response.data;
};

const updateLink = async (linkId: number, request: UpdateShowLinkRequest): Promise<ShowLink> => {
  const response = await apiClient.put<ShowLink>(`links/${linkId}`, request);

  return response.data;
};

const deleteLink = async (linkId: number): Promise<void> => {
  await apiClient.delete(`links/${linkId}`);
};

export const showService = {
  list,
  get,
  create,
  update,
  listEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  listEpisodes,
  getEpisode,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  listLinks,
  getLink,
  createLink,
  updateLink,
  deleteLink,
};
