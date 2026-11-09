import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEditorEpisodeProgress } from '@/interfaces/show/ShowEditorEpisodeProgress';
import type { UnwrapRef } from 'vue';
import { ref } from 'vue';

import { showCategoryService } from '@/services/show/showCategoryService';
import { showEntryService } from '@/services/show/showEntryService';
import { showEpisodeService } from '@/services/show/showEpisodeService';
import { showLinkService } from '@/services/show/showLinkService';
import { showService } from '@/services/show/showService';
import { showTitleService } from '@/services/show/showTitleService';
import { getChangedObject } from '@/utils/object/hasObjectChanged';
import { deleteRemovedItems } from '@/utils/sync/deleteRemovedItems';
import { getSyncPlan } from '@/utils/sync/getSyncPlan';
import { saveItems } from '@/utils/sync/saveItems';
import { syncItems } from '@/utils/sync/syncItems';

/** A show as a ref unwraps it; the sync helpers take its nested lists, but not the plain interfaces. */
type ShowDraft = UnwrapRef<Show>;

/**
 * Creates the show, or updates its own fields when they changed.
 * @param draft - The show being saved.
 * @param savedShow - What the backend holds, or null for a show not created yet.
 * @returns Nothing.
 */
const saveShowFields = async (draft: ShowDraft, savedShow: ShowDraft | null): Promise<void> => {
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
    getChangedObject(savedShow, draft, {
      excludes: ['titles', 'categories', 'entries', 'outgoing_links', 'incoming_links', 'watch_progress'],
    }) !== undefined;

  if (hasShowChanged) {
    await showService.update(draft.id, request);
  }
};

/**
 * Adds and removes the show's categories.
 * @param draft - The show being saved.
 * @param savedShow - What the backend holds, or null for a show not created yet.
 * @returns Nothing.
 */
const saveCategories = async (draft: ShowDraft, savedShow: ShowDraft | null): Promise<void> => {
  const selectedIds = new Set<number>((draft.categories ?? []).map((category) => category.id));
  const savedIds = new Set<number>((savedShow?.categories ?? []).map((category) => category.id));

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
 * Syncs episodes per entry after the entries exist, counting progress because uploads can take a while. An episode
 * moved to another entry is updated with its new entry, not deleted and created again.
 * @param draft - The show being saved.
 * @param savedShow - What the backend holds, or null for a show not created yet.
 * @param onEpisodeProgress - Called as episodes are saved, with how many are done.
 * @returns Nothing.
 */
const saveEpisodes = async (
  draft: ShowDraft,
  savedShow: ShowDraft | null,
  onEpisodeProgress: (progress: ShowEditorEpisodeProgress) => void,
): Promise<void> => {
  const savedEntries = savedShow?.entries ?? [];
  const episodeSyncs = (draft.entries ?? []).map((entry) => {
    const savedEntry = savedEntries.find((candidate) => candidate.id === entry.id);

    // The saved entry keeps the list, so deleted episodes drop out of it and a retry skips them.
    if (savedEntry) {
      savedEntry.episodes ??= [];
    }

    return { entry, episodes: entry.episodes ?? [], savedEpisodes: savedEntry?.episodes ?? [] };
  });

  // An entry deletes only the episodes that are in no entry now: one moved away lives on in its new entry.
  const draftEpisodes = episodeSyncs.flatMap(({ episodes }) => episodes);

  const total = episodeSyncs.reduce((amount, { episodes, savedEpisodes }) => {
    const { toCreate, toUpdate } = getSyncPlan(episodes, savedEpisodes, 'id');
    const { toDelete } = getSyncPlan(draftEpisodes, savedEpisodes, 'id');

    return amount + toCreate.length + toUpdate.length + toDelete.length;
  }, 0);

  if (total === 0) {
    return;
  }

  let done = 0;
  onEpisodeProgress({ done, total });

  const countEpisode = (): void => {
    done++;
    onEpisodeProgress({ done, total });
  };

  // Every upload before any delete: a file added again in another entry can be the stored video file of an episode
  // deleted here, and the delete removes that file.
  for (const { entry, episodes, savedEpisodes } of episodeSyncs) {
    await saveItems(episodes, savedEpisodes, {
      create: (episode) => showEpisodeService.create(entry.id, episode),
      // A moved episode isn't in its new entry's saved list, so it lands here and the entry id moves it.
      update: async (id, episode) => {
        await showEpisodeService.update(id, { ...episode, show_entry_id: entry.id });

        if (savedEpisodes.some((saved) => saved.id === id)) {
          return;
        }

        // It moved: its saved copy moves too, so a retry after a later failure compares it with the entry the backend
        // has it in now. Left in the old entry, moving it back would look like no change and never be sent.
        // In place: the delete pass below holds these same lists.
        for (const savedEntry of savedEntries) {
          const index = savedEntry.episodes?.findIndex((saved) => saved.id === id) ?? -1;

          if (index !== -1) {
            savedEntry.episodes?.splice(index, 1);
          }
        }
        savedEpisodes.push({ ...episode, show_entry_id: entry.id });
      },
      onItem: countEpisode,
    });
  }

  for (const { savedEpisodes } of episodeSyncs) {
    await deleteRemovedItems(draftEpisodes, savedEpisodes, {
      delete: (id) => showEpisodeService.remove(id),
      onItem: countEpisode,
    });
  }
};

/**
 * Saves show drafts with their titles, categories, entries, episodes and links, in the order the backend needs:
 *
 * - the show first, so a new show has an id;
 * - entries are created before their episodes;
 * - every upload runs before any delete, and entries are deleted last, because deleting an episode or an entry
 *   deletes video files that a moved or re-added episode may still need.
 *
 * @returns `episodeProgress`, how many episodes a running save has done (null when none runs, as uploads can take a
 * while), and `save`.
 */
export const useShowDraftSave = () => {
  const episodeProgress = ref<ShowEditorEpisodeProgress | null>(null);

  /**
   * Saves a draft. `savedShow` is kept in line with each step, and created ids are written onto the draft, so calling
   * this again after a failure only retries what did not finish.
   *
   * @param draft - The show being saved.
   * @param savedShow - What the backend holds, or null for a show not created yet, so every item is created.
   * @returns Nothing. A new show's id is on the draft afterwards.
   */
  const save = async (draft: ShowDraft, savedShow: ShowDraft | null): Promise<void> => {
    const onEpisodeProgress = (progress: ShowEditorEpisodeProgress): void => {
      episodeProgress.value = progress;
    };

    try {
      await saveShowFields(draft, savedShow);
      await syncItems(draft.titles, savedShow?.titles ?? [], {
        create: (title) => showTitleService.create(draft.id, title),
        update: async (id, title) => {
          await showTitleService.update(id, title);
        },
        delete: (id) => showTitleService.remove(id),
      });
      await saveCategories(draft, savedShow);

      const savedEntries = savedShow?.entries ?? [];
      await saveItems(draft.entries ?? [], savedEntries, {
        compareOptions: { excludes: ['episodes', 'watch_status'] },
        create: (entry) => showEntryService.create(draft.id, entry),
        update: async (id, entry) => {
          await showEntryService.update(id, entry);
        },
      });
      await saveEpisodes(draft, savedShow, onEpisodeProgress);
      // Entries go last: deleting one deletes its episodes and their files, and some may have moved out of it above.
      await deleteRemovedItems(draft.entries ?? [], savedEntries, {
        delete: (id) => showEntryService.remove(id),
      });

      await syncItems(draft.outgoing_links ?? [], savedShow?.outgoing_links ?? [], {
        create: (link) => showLinkService.create(draft.id, link),
        update: async (id, link) => {
          await showLinkService.update(id, link);
        },
        delete: (id) => showLinkService.remove(id),
      });
    } finally {
      episodeProgress.value = null;
    }
  };

  return { episodeProgress, save };
};
