import type { ShowSection } from '@/interfaces/api/models/ShowSection';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import type { ComputedRef, Ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { ShowSectionQueryKey } from '@/enums/query/showSectionQueryKey';
import { showSectionService } from '@/services/show/showSectionService';
import { deepClone } from '@/utils/clone/deepClone';

/** The home page's category sections as the admin edits them, from `useShowSections`. */
export interface ShowSections {
  /** The sections in their order on screen, which a drag changes before the save finishes. */
  sections: Ref<ShowSection[]>;
  /** Whether the sections load for the first time or after a refresh; not while an order save runs. */
  isLoading: ComputedRef<boolean>;
  /** Whether a new order is being saved. */
  isSavingOrder: Ref<boolean>;
  /** Saves a new order. */
  saveOrder: (sections: ShowSection[]) => Promise<void>;
  /** Reloads the sections after an edit elsewhere and drops the home page's cache, which is built from them. */
  refresh: () => Promise<void>;
}

/**
 * Loads the home page's category sections for the admin and saves their order.
 * @returns The sections, their loading and saving state, and the save and refresh actions.
 */
export const useShowSections = (): ShowSections => {
  const sections = ref<ShowSection[]>([]);
  const isSavingOrder = ref<boolean>(false);

  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  const sectionsQuery = useAPIQuery<PaginatedResponse<ShowSection>>({
    queryKey: [ShowSectionQueryKey.AdminShowSections],
    queryFn: async () => {
      return await showSectionService.list({
        sort: 'sort_order',
        page: { number: 0, size: 0 },
      });
    },
    placeholderData: (previousData) => previousData,
  });

  const isLoading = computed<boolean>(() => sectionsQuery.isFetching.value && !isSavingOrder.value);

  /**
   * Home builds its carousels from sections and their categories, so its cache goes after every change.
   * @returns Nothing.
   */
  const invalidateHomeShows = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: [ShowQueryKey.HomeShows] });
  };

  /**
   * Saves the dragged order by renumbering sections from 0 and patching only those whose position changed.
   * @param orderedSections - Sections in their new order on screen.
   * @returns Nothing.
   */
  const saveOrder = async (orderedSections: ShowSection[]): Promise<void> => {
    const changedSections = orderedSections.filter((section, index) => section.sort_order !== index);

    if (changedSections.length === 0) {
      return;
    }

    isSavingOrder.value = true;

    try {
      await Promise.all(
        orderedSections.map(async (section, index) => {
          if (section.sort_order === index) {
            return;
          }

          await showSectionService.update(section.id, { sort_order: index });
          section.sort_order = index;
        }),
      );

      // Bring the cache in line with the saved order; the paused watch keeps the screen as-is.
      await sectionsQuery.refetch();
      showSuccessSnackbar(t('frontpage.orderSaved'));
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);

      // Assign directly: the watch is paused while saving, and an unchanged result keeps the same reference.
      const { data } = await sectionsQuery.refetch();
      sections.value = deepClone(data?.data ?? []);
    } finally {
      isSavingOrder.value = false;
      await invalidateHomeShows();
    }
  };

  /**
   * Reloads the sections and drops the home page's cache.
   * @returns Nothing.
   */
  const refresh = async (): Promise<void> => {
    await Promise.all([sectionsQuery.refetch(), invalidateHomeShows()]);
  };

  watch(
    () => sectionsQuery.data.value,
    (data) => {
      // Keep the dragged order on screen until its saves finish.
      if (isSavingOrder.value) {
        return;
      }

      sections.value = deepClone(data?.data ?? []);
    },
    { immediate: true },
  );

  return { sections, isLoading, isSavingOrder, saveOrder, refresh };
};
