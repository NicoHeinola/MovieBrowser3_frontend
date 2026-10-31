import type { Show } from '@/interfaces/api/models/Show';
import type { Ref } from 'vue';
import { keepPreviousData, useQueryClient } from '@tanstack/vue-query';
import { computed, watch } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';
import { findShow } from '@/utils/show/findShow';

const showQueryKeys: unknown[] = Object.values(ShowQueryKey);

/**
 * Reads the drawer's show from the query cache by id, so every cache patch, such as new watch progress, reaches it.
 * A show already held by a cached list opens without a request; any other show is fetched while the previous one stays,
 * and a show that fails to load hands the drawer back to the previous one.
 * @param showId - The id of the shown show, or null for none; reset to the last loaded id when a show fails to load.
 * @param isShown - Whether the drawer is open; a closed drawer never fetches.
 * @returns The shown show and whether a newly picked show is still loading.
 */
export const useSelectedShow = (showId: Ref<number | null>, isShown: Readonly<Ref<boolean>>) => {
  /** The id of the last show that loaded, so a failed switch can return to it. */
  let loadedShowId: number | null = null;

  const queryClient = useQueryClient();

  /**
   * Looks the show up in the cached show queries, so opening it needs no request.
   * @returns The cached show and when its query was fetched, or undefined when no cached query holds it.
   */
  const findCachedShow = (): { show: Show; updatedAt: number } | undefined => {
    if (showId.value === null) {
      return undefined;
    }

    for (const query of queryClient.getQueryCache().findAll({
      predicate: (candidate) => showQueryKeys.includes(candidate.queryKey[0]),
    })) {
      const show = findShow(query.state.data, showId.value);
      if (show) {
        return { show, updatedAt: query.state.dataUpdatedAt };
      }
    }

    return undefined;
  };

  const showQuery = useAPIQuery<Show>({
    queryKey: computed(() => [ShowQueryKey.SelectedShow, showId.value]),
    queryFn: () => showService.get(showId.value as number),
    enabled: computed<boolean>(() => isShown.value && showId.value !== null),
    initialData: () => findCachedShow()?.show,
    /** The copy is as old as the list it came from, so it refetches once that list would. */
    initialDataUpdatedAt: () => findCachedShow()?.updatedAt,
    placeholderData: keepPreviousData,
  });

  const show = computed<Show | null>(() => (showId.value === null ? null : (showQuery.data.value ?? null)));
  const isSwitchingShow = computed<boolean>(() => showQuery.isPlaceholderData.value);

  watch(
    show,
    () => {
      if (show.value && !isSwitchingShow.value) {
        loadedShowId = show.value.id;
      }
    },
    { immediate: true },
  );

  watch(
    () => showQuery.isError.value,
    (isError) => {
      /** The previous show is kept only while loading, so after an error the drawer would otherwise go blank. */
      if (isError && loadedShowId !== null && loadedShowId !== showId.value) {
        showId.value = loadedShowId;
      }
    },
  );

  return {
    isSwitchingShow,
    show,
  };
};
