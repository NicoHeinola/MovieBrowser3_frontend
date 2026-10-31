import type { Episode } from '@/interfaces/api/models/Episode';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { useShowPlayback } from '@/composables/show/useShowPlayback';
import { getResumeEpisode } from '@/utils/show/getResumeEpisode';

/**
 * Drawer playback for the shown show: picks where "watch" starts and tracks which button started a playback.
 * The saved progress reaches the shown show through the query cache.
 * @param show - The shown show.
 * @param selectedEntry - The selected entry, or null to target the whole show.
 * @returns The playback state and the watch actions.
 */
export const useSelectedShowPlayback = (
  show: Readonly<Ref<Show | null>>,
  selectedEntry: Readonly<Ref<ShowEntry | null>>,
) => {
  /** Which button started the pending playback, so only that one shows loading. */
  const isStartingTarget = ref<boolean>(false);
  const startingEpisodeId = ref<number | null>(null);

  const { isStartingPlayback, playEpisode, playShow } = useShowPlayback();

  /** The episode "watch" starts from within the selected entry, or within the whole show when none is selected. */
  const resumeEpisode = computed<Episode | null>(() => getResumeEpisode(show.value, selectedEntry.value));

  const isContinuing = computed<boolean>(
    () => resumeEpisode.value !== null && resumeEpisode.value.id === show.value?.watch_progress?.episode_id,
  );

  /** Continues the selected entry, or the whole show when none is selected. */
  const watchTarget = async (): Promise<void> => {
    if (!show.value || isStartingPlayback.value) {
      return;
    }

    isStartingTarget.value = true;

    try {
      await playShow(show.value, selectedEntry.value);
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
      await playEpisode(episode);
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
