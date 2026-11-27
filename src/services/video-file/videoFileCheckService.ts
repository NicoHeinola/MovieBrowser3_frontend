import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import type { VideoFileProblems } from '@/interfaces/api/models/VideoFileProblems';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Reads the running check's progress and the last finished run's result.
 * @returns The check status.
 */
const get = async (): Promise<VideoFileCheckStatus> => {
  const response = await apiClient.get<VideoFileCheckStatus>('video-files/check');

  return response.data;
};

/**
 * Queues a background check of every episode's video file, unless one is going.
 * @returns The check's status right after.
 */
const start = async (): Promise<VideoFileCheckStatus> => {
  const response = await apiClient.post<VideoFileCheckStatus>('video-files/check');

  return response.data;
};

/**
 * Checks one show's video files right away. Waits longer than most requests: a Windows drive can be slow.
 * @param showId - The show.
 * @returns The problems its files have.
 */
const checkShow = async (showId: number): Promise<VideoFileProblems> => {
  const response = await apiClient.post<VideoFileProblems>(`shows/${showId}/video-file-check`, null, {
    timeout: 60_000,
  });

  return response.data;
};

export const videoFileCheckService = {
  get,
  start,
  checkShow,
};
