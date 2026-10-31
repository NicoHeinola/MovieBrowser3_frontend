import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Opens the episode's whole entry as a media player playlist, starting at the episode, and saves it as the user's progress.
 * @param episodeId - The episode to start from.
 * @returns The saved watch progress of the show.
 */
const play = async (episodeId: number): Promise<ShowWatchProgress> => {
  const response = await apiClient.post<ShowWatchProgress>(`episodes/${episodeId}/playback`);

  return response.data;
};

export const episodePlaybackService = {
  play,
};
