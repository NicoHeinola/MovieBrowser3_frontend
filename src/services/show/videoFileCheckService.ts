import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Reads the running check's progress and the last finished run's result.
 * @returns The check status.
 */
const get = async (): Promise<VideoFileCheckStatus> => {
  const response = await apiClient.get<VideoFileCheckStatus>('video-files/check');

  return response.data;
};

/** Queues a background check of every episode's video file. Fails when one is already running. */
const start = async (): Promise<void> => {
  await apiClient.post('video-files/check');
};

export const videoFileCheckService = {
  get,
  start,
};
