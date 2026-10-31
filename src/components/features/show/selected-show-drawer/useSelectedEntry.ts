import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';

/**
 * Tracks the drawer's selected entry by id, so the selection survives the cache replacing the show's entries,
 * such as after a watch status save, and always resolves to the current entry object.
 * @param entries - The shown show's entries.
 * @returns The selected entry, writable for a select input, and a function that clears it.
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
   * Clears the selection, so the whole show is targeted.
   * @returns void
   */
  const clearSelectedEntry = (): void => {
    selectedEntryId.value = null;
  };

  return {
    clearSelectedEntry,
    selectedEntry,
  };
};
