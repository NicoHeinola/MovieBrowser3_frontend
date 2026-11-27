import type { VideoBaseFolderMoveStatus } from '@/interfaces/api/models/VideoBaseFolderMoveStatus';
import type { StartVideoBaseFolderMoveRequest } from '@/interfaces/api/requests/StartVideoBaseFolderMoveRequest';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Reads the running video base folder move, or the last one.
 * @returns The move's status.
 */
const get = async (): Promise<VideoBaseFolderMoveStatus> => {
  const response = await apiClient.get<VideoBaseFolderMoveStatus>('video-files/move');

  return response.data;
};

/**
 * Starts to move every video file into a new video base folder. The move runs in the background. The setting changes
 * when all files are in the new folder.
 * @param request - The new video base folder.
 * @returns The move's status.
 */
const start = async (request: StartVideoBaseFolderMoveRequest): Promise<VideoBaseFolderMoveStatus> => {
  const response = await apiClient.post<VideoBaseFolderMoveStatus>('video-files/move', request);

  return response.data;
};

export const videoBaseFolderMoveService = {
  get,
  start,
};
