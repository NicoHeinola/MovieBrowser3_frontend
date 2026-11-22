import type { MalAnime } from '@/interfaces/api/models/MalAnime';
import type { ListResponse } from '@/interfaces/api/responses/ListResponse';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Searches MyAnimeList's anime through the backend. MAL answers with about ten matches, so there are no pages.
 * Takes the name alone instead of `ApiQueryParams`: the endpoint has no pages or sorts.
 * @param search - The name to search for.
 * @returns The matching anime, in MAL's order.
 */
const list = async (search: string): Promise<ListResponse<MalAnime>> => {
  const response = await apiClient.get<ListResponse<MalAnime>>('mal-anime', { params: { filter: { search } } });

  return response.data;
};

export const malAnimeService = {
  list,
};
