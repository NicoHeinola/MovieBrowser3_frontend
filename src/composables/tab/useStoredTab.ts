import type { WritableComputedRef } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';

/**
 * A page's open tab, kept in this browser so the last one used opens next time.
 * @param key - The local storage key.
 * @param tabs - Every tab, the default first.
 * @returns The open tab, for `v-model`.
 */
export const useStoredTab = <T extends string>(key: string, tabs: readonly [T, ...T[]]): WritableComputedRef<T> => {
  const storedTab = useLocalStorage<string>(key, tabs[0]);

  return computed<T>({
    // A stored value that is no tab (from an older version) opens the default one.
    get: () => tabs.find((tab) => tab === storedTab.value) ?? tabs[0],
    set: (tab) => {
      storedTab.value = tab;
    },
  });
};
