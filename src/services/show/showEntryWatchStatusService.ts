import type { ShowEntryWatchStatus } from '@/interfaces/api/models/ShowEntryWatchStatus';
import type { UpdateShowEntryWatchStatusRequest } from '@/interfaces/api/requests/UpdateShowEntryWatchStatusRequest';

import { apiClient } from '@/plugins/api/apiClient';

const update = async (entryId: number, request: UpdateShowEntryWatchStatusRequest): Promise<ShowEntryWatchStatus> => {
  const response = await apiClient.put<ShowEntryWatchStatus>(`show-entries/${entryId}/watch-status`, request);

  return response.data;
};

const remove = async (entryId: number): Promise<void> => {
  await apiClient.delete(`show-entries/${entryId}/watch-status`);
};

export const showEntryWatchStatusService = {
  update,
  remove,
};
