import type { Show } from '@/interfaces/api/models/Show';
import { useQueryClient } from '@tanstack/vue-query';
import { onScopeDispose, ref } from 'vue';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { i18n } from '@/plugins/i18n';
import { showService } from '@/services/show/showService';
import { useShowDrawerStore } from '@/stores/show/useShowDrawerStore';
import { WATCHED_SHOW_STATUSES } from '@/utils/show/watch-status/watchedShowStatuses';

/**
 * "Surprise me": picks a random show you haven't watched, like the home page's random row.
 * @param onPick - Receives the picked show, to open it.
 * @returns The pick function and whether a pick is loading.
 */
export const useSurpriseShow = (onPick: (show: Show) => void) => {
  const isPicking = ref<boolean>(false);
  /** Whether the button that picks is gone. */
  let isDisposed = false;

  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar, showWarningSnackbar } = useCommonSnackbar();
  const showDrawerStore = useShowDrawerStore();

  /**
   * Picks a random unwatched show, other than the one the drawer holds when there is another. Errors and an empty pick
   * are shown in a snackbar.
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

      // The drawer closed or the user logged out meanwhile, so the pick must not change what is open now.
      if (isDisposed) {
        return;
      }

      // Two picks, so "pick another" can skip the show already open. With a single match it opens that one again.
      const show = response.data.find((item) => item.id !== showDrawerStore.showId) ?? response.data[0];

      if (!show) {
        showWarningSnackbar(i18n.global.t('show.surpriseNoShows'));
        return;
      }

      onPick(show);
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    } finally {
      isPicking.value = false;
    }
  };

  onScopeDispose(() => {
    isDisposed = true;
  });

  return {
    isPicking,
    pickShow,
  };
};
