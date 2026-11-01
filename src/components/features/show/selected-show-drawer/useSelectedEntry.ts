import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';

/**
 * Tracks the drawer's selected entry by id, so the selection survives the cache replacing the show's entries,
 * such as after a watch status save, and always resolves to the current entry object.
 * @param entries - The shown show's entries.
 * @returns The selected entry, writable for a select input, and a function that resets it.
 */
export const useSelectedEntry = (entries: Readonly<Ref<ShowEntry[]>>) => {
  const selectedEntryId = ref<number | null>(null);

  const selectedEntry = computed<ShowEntry | null>({
    get: () => entries.value.find((entry) => entry.id === selectedEntryId.value) ?? null,
    set: (entry) => {
      selectedEntryId.value = entry?.id ?? null;
    },
  });

  /**
   * Resets the selection to the given entry, or to none so the whole show is targeted.
   * @param entryId - The entry to select, such as the last watched one.
   * @returns void
   */
  const resetSelectedEntry = (entryId: number | null = null): void => {
    selectedEntryId.value = entryId;
  };

  return {
    resetSelectedEntry,
    selectedEntry,
  };
};
