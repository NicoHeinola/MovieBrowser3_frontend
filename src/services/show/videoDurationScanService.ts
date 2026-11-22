import type { VideoDurationScanStatus } from '@/interfaces/api/models/VideoDurationScanStatus';
import type { StartVideoDurationScanRequest } from '@/interfaces/api/requests/StartVideoDurationScanRequest';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Reads the running episode length scan's progress and the last finished scan's result.
 * @returns The scan status.
 */
const get = async (): Promise<VideoDurationScanStatus> => {
  const response = await apiClient.get<VideoDurationScanStatus>('video-files/duration-scan');

  return response.data;
};

/**
 * Queues episodes to have their lengths read in the background. A running scan takes them too.
 * @param request - Which shows to read; empty to read every episode with a file.
 * @returns The scan status right after queuing.
 */
const start = async (request: StartVideoDurationScanRequest = {}): Promise<VideoDurationScanStatus> => {
  const response = await apiClient.post<VideoDurationScanStatus>('video-files/duration-scan', request);

  return response.data;
};

export const videoDurationScanService = {
  get,
  start,
};
