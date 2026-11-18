import type { Ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { ref, watch } from 'vue';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { i18n } from '@/plugins/i18n';
import { showService } from '@/services/show/showService';
import { WATCHED_SHOW_STATUSES } from '@/utils/show/watch-status/watchedShowStatuses';

/** The show drawer a surprise pick opens. */
export interface SurpriseShowOptions {
  /** The drawer's show id, set to the picked show. */
  showId: Ref<number | null>;
  /** Whether the drawer is open; a pick opens it. */
  isShown: Ref<boolean>;
}

/**
 * "Surprise me": picks a random show you haven't watched, like the home page's random row, and opens it in the show
 * drawer. While the drawer shows a pick, `isSurprisePick` is true, so the drawer can offer another one.
 * @param options - The drawer to open.
 * @returns The pick function and whether a pick is loading or shown.
 */
export const useSurpriseShow = (options: SurpriseShowOptions) => {
  const isPicking = ref<boolean>(false);
  /** Whether the open drawer shows a surprise pick. Closing the drawer ends it. */
  const isSurprisePick = ref<boolean>(false);

  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar, showWarningSnackbar } = useCommonSnackbar();

  /**
   * Picks a random unwatched show, other than the one the drawer holds when there is another, and opens it. Errors and
   * an empty pick are shown in a snackbar.
   * @returns void
   */
  const pickShow = async (): Promise<void> => {
    if (isPicking.value) {
      return;
    }

    isPicking.value = true;

    try {
      // Kept in the query cache, so the drawer opens on the pick at once instead of the previous show.
      const response = await queryClient.query({
        queryKey: [ShowQueryKey.SurpriseShows],
        queryFn: () =>
          showService.list({
            filter: { exclude_watch_status: WATCHED_SHOW_STATUSES },
            sort: 'random',
            page: { size: 2 },
          }),
        // Every press rolls again instead of reusing the last picks.
        staleTime: 0,
      });

      // Two picks, so "pick another" can skip the show already open. With a single match it opens that one again.
      const show = response.data.find((item) => item.id !== options.showId.value) ?? response.data[0];

      if (!show) {
        showWarningSnackbar(i18n.global.t('show.surpriseNoShows'));
        return;
      }

      options.showId.value = show.id;
      options.isShown.value = true;
      isSurprisePick.value = true;
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    } finally {
      isPicking.value = false;
    }
  };

  watch(options.isShown, (isShown) => {
    if (!isShown) {
      isSurprisePick.value = false;
    }
  });

  return {
    isPicking,
    isSurprisePick,
    pickShow,
  };
};
