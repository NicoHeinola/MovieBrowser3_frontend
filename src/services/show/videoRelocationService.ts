import type { VideoRelocationStatus } from '@/interfaces/api/models/VideoRelocationStatus';
import type { StartVideoRelocationRequest } from '@/interfaces/api/requests/StartVideoRelocationRequest';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Reads the running video folder move, or the last one.
 * @returns The move's status.
 */
const get = async (): Promise<VideoRelocationStatus> => {
  const response = await apiClient.get<VideoRelocationStatus>('video-files/relocation');

  return response.data;
};

/**
 * Changes the video folder and moves every video file into it in the background. With nothing to move, the folder is
 * saved right away and the status says the move already ended.
 * @param request - The new video folder.
 * @returns The move's status.
 */
const start = async (request: StartVideoRelocationRequest): Promise<VideoRelocationStatus> => {
  const response = await apiClient.post<VideoRelocationStatus>('video-files/relocation', request);

  return response.data;
};

export const videoRelocationService = {
  get,
  start,
};
