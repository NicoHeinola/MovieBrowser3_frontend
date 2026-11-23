import type { ComputedRef, Ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { computed, ref } from 'vue';

/** How long typing pauses before a search goes out. */
const SEARCH_DEBOUNCE_MS = 300;

/** A search field's text and the term a search goes out with. */
export interface DebouncedSearch {
  /** The field's text, as typed. */
  search: Ref<string>;
  /** The typed text, trimmed. */
  term: ComputedRef<string>;
  /** The trimmed text once typing pauses: what to search for. */
  debouncedTerm: ComputedRef<string>;
  /** Whether the typed term hasn't gone out yet, so old results mustn't pass for its results. */
  isWaiting: ComputedRef<boolean>;
}

/**
 * The search field of a search-as-you-type list (the navigation search, the show and MyAnimeList pickers).
 * @param initialSearch - Text to start with, such as a show's title.
 * @returns The field's text, its trimmed and debounced terms, and whether a typed term is still waiting.
 */
export const useDebouncedSearch = (initialSearch = ''): DebouncedSearch => {
  const search = ref<string>(initialSearch);
  const debouncedSearch = refDebounced(search, SEARCH_DEBOUNCE_MS);

  // A clearable field sets null when cleared
  const term = computed<string>(() => (search.value ?? '').trim());
  const debouncedTerm = computed<string>(() => (debouncedSearch.value ?? '').trim());
  const isWaiting = computed<boolean>(() => term.value !== debouncedTerm.value);

  return { search, term, debouncedTerm, isWaiting };
};
