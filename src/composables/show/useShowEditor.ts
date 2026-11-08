import type { ShowEditorEpisodeProgress } from './ShowEditorEpisodeProgress';
import type { Show } from '@/interfaces/api/models/Show';
import type { Ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { showCategoryService } from '@/services/show/showCategoryService';
import { showEntryService } from '@/services/show/showEntryService';
import { showEpisodeService } from '@/services/show/showEpisodeService';
import { showLinkService } from '@/services/show/showLinkService';
import { showService } from '@/services/show/showService';
import { showTitleService } from '@/services/show/showTitleService';
import { deepClone } from '@/utils/clone/deepClone';
import { getChangedObject } from '@/utils/object/hasObjectChanged';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { getSyncPlan } from '@/utils/sync/getSyncPlan';
import { syncItems } from '@/utils/sync/syncItems';

/**
 * Builds the show a new show starts from: one empty primary title and one season.
 * @returns The new show.
 */
const createEmptyShow = (): Show =>
  ({
    titles: [{ title: '', is_primary: true }],
    categories: [],
    entries: [{ name: 'Season 1', type: ShowEntryType.Season, sort_order: 0, episodes: [] }],
    outgoing_links: [],
    incoming_links: [],
  }) as unknown as Show;

/**
 * Copies a show without the current user's watch data, which the watch streams patch into every cached show while
 * the user plays it somewhere else. The editor doesn't edit that data, so a change to it alone is no reason to reload.
 * @param show - The show.
 * @returns A copy without `watch_progress` and the entries' `watch_status`.
 */
const withoutWatchData = (show: Show): Show => {
  const copy = deepClone(show);

  delete copy.watch_progress;
  for (const entry of copy.entries ?? []) {
    delete entry.watch_status;
  }

  return copy;
};

/**
 * Loads a show into an editable draft and saves the draft with all its titles, categories, entries, episodes and
 * links. A background refetch replaces the draft only while it has no unsaved changes, so edits are never lost.
 * @param showId - The id of the show to edit, or null to add a new show.
 * @returns The draft, its load and save state, and the save, delete and discard actions.
 */
export const useShowEditor = (showId: Readonly<Ref<number | null>>) => {
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();
  const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /** The show being edited; form parts change it in place. */
  const show = ref<Show | null>(showId.value === null ? createEmptyShow() : null);
  /** The draft as it was loaded or last saved, for change detection and discarding. */
  const pristineShow = ref<Show | null>(show.value ? deepClone(show.value) : null);
  /** What the backend holds, for the sync plan. Null for a show not created yet, so every item is created. */
  const savedShow = ref<Show | null>(null);

  /** The draft's type as the ref unwraps it; syncItems takes its nested lists, but not the plain interfaces. */
  type ShowDraft = NonNullable<typeof show.value>;

  const isSaving = ref<boolean>(false);
  const isDeleting = ref<boolean>(false);
  const episodeProgress = ref<ShowEditorEpisodeProgress | null>(null);

  const showQuery = useAPIQuery<Show>({
    queryKey: computed(() => [ShowQueryKey.AdminShowEditor, showId.value]),
    queryFn: () => showService.get(showId.value as number),
    enabled: computed<boolean>(() => showId.value !== null),
    // Edits start from what the backend holds now, not from a list that may be minutes old.
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const hasChanges = computed<boolean>(() => {
    if (!show.value || !pristineShow.value) {
      return false;
    }

    return getChangedObject(pristineShow.value, show.value) !== undefined;
  });

  const isLoading = computed<boolean>(() => show.value === null && showQuery.isLoading.value);
  const isLoadError = computed<boolean>(() => show.value === null && showQuery.isError.value);

  /**
   * Replaces the draft and both snapshots with a show from the backend.
   * @param loadedShow - The show as the backend returned it.
   * @returns Nothing.
   */
  const reset = (loadedShow: Show): void => {
    show.value = deepClone(loadedShow);
    pristineShow.value = deepClone(loadedShow);
    savedShow.value = deepClone(loadedShow);
  };

  watch(
    () => showQuery.data.value,
    (loadedShow) => {
      // A refetch during a save or over unsaved edits would throw the user's work away.
      if (!loadedShow || isSaving.value || hasChanges.value) {
        return;
      }

      // Playing the show in another tab patches its watch data every few seconds; keep the draft for that.
      const isWatchDataOnly =
        pristineShow.value?.id === loadedShow.id &&
        getChangedObject(withoutWatchData(pristineShow.value as Show), withoutWatchData(loadedShow)) === undefined;

      if (!isWatchDataOnly) {
        reset(loadedShow);
      }
    },
    { immediate: true },
  );

  /**
   * Creates the show, or updates its own fields when they changed.
   * @param draft - The show being saved.
   * @returns Nothing.
   */
  const saveShowFields = async (draft: ShowDraft): Promise<void> => {
    const request = {
      banner_url: draft.banner_url,
      card_image_url: draft.card_image_url,
      preview_url: draft.preview_url,
      description: draft.description,
    };

    if (!draft.id) {
      draft.id = (await showService.create(request)).id;
      return;
    }

    const hasShowChanged =
      getChangedObject(savedShow.value, draft, {
        excludes: ['titles', 'categories', 'entries', 'outgoing_links', 'incoming_links', 'watch_progress'],
      }) !== undefined;

    if (hasShowChanged) {
      await showService.update(draft.id, request);
    }
  };

  /**
   * Adds and removes the show's categories.
   * @param draft - The show being saved.
   * @returns Nothing.
   */
  const saveCategories = async (draft: ShowDraft): Promise<void> => {
    const selectedIds = new Set<number>((draft.categories ?? []).map((category) => category.id));
    const savedIds = new Set<number>((savedShow.value?.categories ?? []).map((category) => category.id));

    for (const categoryId of selectedIds) {
      if (!savedIds.has(categoryId)) {
        await showCategoryService.create(draft.id, categoryId);
      }
    }

    for (const categoryId of savedIds) {
      if (!selectedIds.has(categoryId)) {
        await showCategoryService.remove(draft.id, categoryId);
      }
    }
  };

  /**
   * Syncs episodes per entry after the entries exist, counting progress because uploads can take a while.
   * @param draft - The show being saved.
   * @returns Nothing.
   */
  const saveEpisodes = async (draft: ShowDraft): Promise<void> => {
    const savedEntries = savedShow.value?.entries ?? [];
    const episodeSyncs = (draft.entries ?? []).map((entry) => {
      const savedEntry = savedEntries.find((candidate) => candidate.id === entry.id);

      // The saved entry keeps the list, so syncItems can drop deleted episodes from it and a retry skips them.
      if (savedEntry) {
        savedEntry.episodes ??= [];
      }

      return { entry, episodes: entry.episodes ?? [], savedEpisodes: savedEntry?.episodes ?? [] };
    });

    const total = episodeSyncs.reduce((amount, { episodes, savedEpisodes }) => {
      const { toCreate, toUpdate, toDelete } = getSyncPlan(episodes, savedEpisodes, 'id');

      return amount + toCreate.length + toUpdate.length + toDelete.length;
    }, 0);

    if (total === 0) {
      return;
    }

    episodeProgress.value = { done: 0, total };

    for (const { entry, episodes, savedEpisodes } of episodeSyncs) {
      await syncItems(episodes, savedEpisodes, {
        create: (episode) => showEpisodeService.create(entry.id, episode),
        update: async (id, episode) => {
          await showEpisodeService.update(id, episode);
        },
        delete: (id) => showEpisodeService.remove(id),
        onItem: () => {
          episodeProgress.value = { done: (episodeProgress.value?.done ?? 0) + 1, total };
        },
      });
    }
  };

  /**
   * Saves the draft: the show first, so a new show has an id, then everything that belongs to it. A failed save
   * keeps the draft, and created ids stay on it, so saving again only retries what did not finish.
   * @returns The saved show's id, or null when the save failed.
   */
  const save = async (): Promise<number | null> => {
    const draft = show.value;

    if (!draft || isSaving.value) {
      return null;
    }

    isSaving.value = true;

    try {
      await saveShowFields(draft);
      await syncItems(draft.titles, savedShow.value?.titles ?? [], {
        create: (title) => showTitleService.create(draft.id, title),
        update: async (id, title) => {
          await showTitleService.update(id, title);
        },
        delete: (id) => showTitleService.remove(id),
      });
      await saveCategories(draft);
      await syncItems(draft.entries ?? [], savedShow.value?.entries ?? [], {
        compareOptions: { excludes: ['episodes', 'watch_status'] },
        create: (entry) => showEntryService.create(draft.id, entry),
        update: async (id, entry) => {
          await showEntryService.update(id, entry);
        },
        delete: (id) => showEntryService.remove(id),
      });
      await saveEpisodes(draft);
      await syncItems(draft.outgoing_links ?? [], savedShow.value?.outgoing_links ?? [], {
        create: (link) => showLinkService.create(draft.id, link),
        update: async (id, link) => {
          await showLinkService.update(id, link);
        },
        delete: (id) => showLinkService.remove(id),
      });

      // Reload so the draft holds what the backend made of it, such as file sizes and ids of created items.
      const reloadedShow = await showService.get(draft.id);
      queryClient.setQueryData([ShowQueryKey.AdminShowEditor, draft.id], reloadedShow);
      reset(reloadedShow);

      showSuccessSnackbar(t('show.saved'));

      return draft.id;
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);

      return null;
    } finally {
      isSaving.value = false;
      episodeProgress.value = null;

      // Even a failed save may have reached the backend, and shows appear on many pages and autocompletes.
      if (draft.id) {
        void queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey));
      }
    }
  };

  /**
   * Deletes the show after the user confirms.
   * @returns Whether the show was deleted.
   */
  const remove = async (): Promise<boolean> => {
    const draft = show.value;

    if (!draft?.id) {
      return false;
    }

    const isConfirmed = await confirm({
      message: t('show.deleteConfirm'),
      confirmText: t('common.delete'),
      confirmColor: 'error',
      cancelText: t('common.cancel'),
    });

    if (!isConfirmed) {
      return false;
    }

    isDeleting.value = true;

    try {
      await showService.remove(draft.id);
      // Nothing should look like it can be saved now, so a leave guard lets the user go.
      pristineShow.value = deepClone(draft);
      queryClient.removeQueries({ queryKey: [ShowQueryKey.AdminShowEditor, draft.id] });
      void queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey));

      return true;
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);

      return false;
    } finally {
      isDeleting.value = false;
    }
  };

  /**
   * Throws away unsaved changes and goes back to the last loaded or saved show.
   * @returns Nothing.
   */
  const discard = (): void => {
    if (pristineShow.value) {
      show.value = deepClone(pristineShow.value);
    }
  };

  return {
    show,
    isLoading,
    isLoadError,
    isSaving,
    isDeleting,
    hasChanges,
    episodeProgress,
    save,
    remove,
    discard,
  };
};
