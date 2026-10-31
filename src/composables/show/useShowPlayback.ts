import type { Episode } from '@/interfaces/api/models/Episode';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import { ref } from 'vue';

import { useShowWatchProgressCache } from '@/composables/show/useShowWatchProgressCache';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { episodePlaybackService } from '@/services/show/episodePlaybackService';
import { getResumeEpisode } from '@/utils/show/getResumeEpisode';

/**
 * Starts show playback in the external media player and mirrors the saved progress onto the cached show lists.
 * @returns The playback state and the play functions.
 */
export const useShowPlayback = () => {
  const isStartingPlayback = ref<boolean>(false);

  const { applyWatchProgress } = useShowWatchProgressCache();
  const { showAPIErrorSnackbar, showWarningSnackbar } = useCommonSnackbar();

  /**
   * Plays an episode and patches every cached show list with the new progress. Errors are shown in a snackbar.
   * @param episode - The episode to start from; the rest of its entry stays in the playlist.
   * @returns The saved watch progress, or null when playback did not start.
   */
  const playEpisode = async (episode: Pick<Episode, 'id'>): Promise<ShowWatchProgress | null> => {
    if (isStartingPlayback.value) {
      return null;
    }

    isStartingPlayback.value = true;

    try {
      const watchProgress = await episodePlaybackService.play(episode.id);

      applyWatchProgress(watchProgress);

      return watchProgress;
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
      return null;
    } finally {
      isStartingPlayback.value = false;
    }
  };

  /**
   * Continues a show, or one of its entries, from the last started episode, or starts it from the first one.
   * @param show - The show to play.
   * @param entry - Limits playback to this entry, or null for the whole show.
   * @returns The saved watch progress, or null when playback did not start.
   */
  const playShow = async (
    show: Pick<Show, 'entries' | 'watch_progress'>,
    entry: Pick<ShowEntry, 'id' | 'episodes'> | null = null,
  ): Promise<ShowWatchProgress | null> => {
    const episode = getResumeEpisode(show, entry);

    if (!episode) {
      showWarningSnackbar('There are no episodes to play.');
      return null;
    }

    return playEpisode(episode);
  };

  return {
    isStartingPlayback,
    playEpisode,
    playShow,
  };
};
