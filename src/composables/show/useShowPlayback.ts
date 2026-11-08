import type { Episode } from '@/interfaces/api/models/Episode';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import { ref } from 'vue';

import { useShowWatchProgressCache } from '@/composables/show/useShowWatchProgressCache';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { i18n } from '@/plugins/i18n';
import { episodePlaybackService } from '@/services/show/episodePlaybackService';
import { getResumeEpisode } from '@/utils/show/getResumeEpisode';

interface PlaybackOptions {
  /** Start at 0 and clear the saved position instead of resuming. */
  fromStart?: boolean;
}

/**
 * Starts show playback in the external media player and mirrors the saved progress onto the cached show lists.
 * @returns The playback state and the play functions.
 */
export const useShowPlayback = () => {
  const isStartingPlayback = ref<boolean>(false);
  /** The show whose playback `playShow` is starting, so only its card shows a loader. */
  const startingShowId = ref<number | null>(null);

  const { applyWatchProgress } = useShowWatchProgressCache();
  const { showAPIErrorSnackbar, showWarningSnackbar } = useCommonSnackbar();

  /**
   * Plays an episode and patches every cached show list with the new progress. Errors are shown in a snackbar.
   * @param episode - The episode to start from; the rest of its entry stays in the playlist.
   * @param options - Playback options.
   * @returns The saved watch progress, or null when playback did not start.
   */
  const playEpisode = async (
    episode: Pick<Episode, 'id'>,
    options: PlaybackOptions = {},
  ): Promise<ShowWatchProgress | null> => {
    if (isStartingPlayback.value) {
      return null;
    }

    isStartingPlayback.value = true;

    try {
      const request = options.fromStart ? { from_start: true } : {};
      const watchProgress = await episodePlaybackService.play(episode.id, request);

      applyWatchProgress(watchProgress);

      return watchProgress;
    } catch (error: unknown) {
      // A missing video file is not refetched: reloading every list would only flash and reshuffle them.
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
   * @param options - Playback options.
   * @returns The saved watch progress, or null when playback did not start.
   */
  const playShow = async (
    show: Pick<Show, 'id' | 'entries' | 'watch_progress'>,
    entry: Pick<ShowEntry, 'id' | 'episodes'> | null = null,
    options: PlaybackOptions = {},
  ): Promise<ShowWatchProgress | null> => {
    const episode = getResumeEpisode(show, entry);

    if (!episode) {
      showWarningSnackbar(i18n.global.t('show.noEpisodesToPlay'));
      return null;
    }

    // playEpisode ignores this call while another playback starts, so that show must keep its loader.
    if (isStartingPlayback.value) {
      return null;
    }

    startingShowId.value = show.id;

    try {
      return await playEpisode(episode, options);
    } finally {
      startingShowId.value = null;
    }
  };

  return {
    isStartingPlayback,
    playEpisode,
    playShow,
    startingShowId,
  };
};
