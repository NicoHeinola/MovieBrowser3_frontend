import type { Episode } from '@/interfaces/api/models/Episode';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { useShowPlayback } from '@/composables/show/useShowPlayback';
import { getResumeEpisode } from '@/utils/show/getResumeEpisode';

/**
 * Drawer playback for the shown show: picks where "watch" starts and keeps the show's progress in sync after playing.
 * @param show - The shown show; replaced with a copy carrying the new progress after each playback.
 * @param selectedEntry - The selected entry, or null to target the whole show.
 * @returns The playback state and the watch actions.
 */
export const useSelectedShowPlayback = (show: Ref<Show | null>, selectedEntry: Ref<ShowEntry | null>) => {
  /** Which button started the pending playback, so only that one shows loading. */
  const isStartingTarget = ref<boolean>(false);
  const startingEpisodeId = ref<number | null>(null);

  const { isStartingPlayback, playEpisode, playShow } = useShowPlayback();

  /** The episode "watch" starts from within the selected entry, or within the whole show when none is selected. */
  const resumeEpisode = computed<Episode | null>(() => getResumeEpisode(show.value, selectedEntry.value));

  const isContinuing = computed<boolean>(
    () => resumeEpisode.value !== null && resumeEpisode.value.id === show.value?.watch_progress?.episode_id,
  );

  /**
   * Stores the progress saved by a playback on the shown show.
   * @param watchProgress - The saved progress, or null when playback did not start.
   */
  const applyWatchProgress = (watchProgress: ShowWatchProgress | null): void => {
    if (watchProgress && show.value?.id === watchProgress.show_id) {
      show.value = { ...show.value, watch_progress: watchProgress };
    }
  };

  /** Continues the selected entry, or the whole show when none is selected. */
  const watchTarget = async (): Promise<void> => {
    if (!show.value || isStartingPlayback.value) {
      return;
    }

    isStartingTarget.value = true;

    try {
      applyWatchProgress(await playShow(show.value, selectedEntry.value));
    } finally {
      isStartingTarget.value = false;
    }
  };

  /**
   * Plays one episode, keeping the rest of its entry in the playlist.
   * @param episode - The episode to start from.
   */
  const watchEpisode = async (episode: Episode): Promise<void> => {
    if (isStartingPlayback.value) {
      return;
    }

    startingEpisodeId.value = episode.id;

    try {
      applyWatchProgress(await playEpisode(episode));
    } finally {
      startingEpisodeId.value = null;
    }
  };

  return {
    isContinuing,
    isStartingPlayback,
    isStartingTarget,
    resumeEpisode,
    startingEpisodeId,
    watchEpisode,
    watchTarget,
  };
};
