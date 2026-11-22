import type { NekoBtTorrent } from '@/interfaces/api/models/NekoBtTorrent';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { UncountedPaginatedResponse } from '@/interfaces/api/responses/UncountedPaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Searches nekoBT through the backend. nekoBT sets the page size, so `page.size` is ignored.
 * @param query - `filter.search`, `sort` (such as `-size`) and `page.number`.
 * @returns One page of torrents.
 */
const list = async (query: ApiQueryParams): Promise<UncountedPaginatedResponse<NekoBtTorrent>> => {
  const response = await apiClient.get<UncountedPaginatedResponse<NekoBtTorrent>>('nekobt-torrents', {
    params: query,
  });

  return response.data;
};

export const nekoBtTorrentService = {
  list,
};
