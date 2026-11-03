import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import type { PlayEpisodeRequest } from '@/interfaces/api/requests/PlayEpisodeRequest';

import { apiClient } from '@/plugins/api/apiClient';

/**
 * Opens the episode's whole entry as a media player playlist, starting at the episode, and saves it as the user's progress.
 * The player resumes at the saved position when the user's progress is on this episode, unless `from_start` is set.
 * @param episodeId - The episode to start from.
 * @param request - Playback options.
 * @returns The saved watch progress of the show.
 */
const play = async (episodeId: number, request: PlayEpisodeRequest = {}): Promise<ShowWatchProgress> => {
  const response = await apiClient.post<ShowWatchProgress>(`episodes/${episodeId}/playback`, request);

  return response.data;
};

export const episodePlaybackService = {
  play,
};
