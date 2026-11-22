import type { NyaaMirror } from '@/interfaces/nyaa/NyaaMirror';
import type { NyaaSearchFilters } from '@/interfaces/nyaa/NyaaSearchFilters';
import type { NyaaSearchSettings } from '@/interfaces/nyaa/NyaaSearchSettings';

import { useLocalStorage, watchDebounced } from '@vueuse/core';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { nyaaMirrors } from '@/data/nyaa/nyaaMirrors';
import { nyaaSearchFilterDefinitions } from '@/data/nyaa/nyaaSearchFilterDefinitions';
import { nyaaSortOptions } from '@/data/nyaa/nyaaSortOptions';
import { createSearchFilters } from '@/utils/filter/createSearchFilters';
import { getNyaaSearchUrl } from '@/utils/nyaa/getNyaaSearchUrl';
import { getValidNyaaSearchSettings } from '@/utils/nyaa/getValidNyaaSearchSettings';
import { getQueryString } from '@/utils/route/getQueryString';

/**
 * The nyaa tab's search. nyaa can't be searched from the app, so instead of listing results it opens the search on a
 * nyaa mirror in a new tab. The search term is the URL's `q`, which the other torrent tabs use too, so it carries
 * over between tabs and survives a reload. The mirror, sort and filters are remembered in this browser; the filters
 * start on English-translated anime, which counts as an active filter, since clearing them searches every category.
 *
 * @returns The search term, the remembered `settings`, the picked `mirror`, the active filter count, `clearFilters`,
 * `openSearch` and `openMirror`.
 */
export const useNyaaSearch = () => {
  const route = useRoute();
  const router = useRouter();

  const search = ref<string>(getQueryString(route.query.q) ?? '');

  const settings = useLocalStorage<NyaaSearchSettings>(
    'nyaaSearch',
    {
      mirror: nyaaMirrors[0].host,
      sort: nyaaSortOptions[0].value,
      filters: { category: '1_2', trust: '0' },
    },
    // Each stored field is checked, nested filters too: a missing or no longer offered one gets its default
    { mergeDefaults: getValidNyaaSearchSettings },
  );

  const { createEmptyFilters, getFilterParams, countActiveFilters } = createSearchFilters<NyaaSearchFilters>(
    nyaaSearchFilterDefinitions,
    'q',
  );

  /** The picked mirror; the stored host is always a listed one, the first one is only a fallback for the type. */
  const mirror = computed<NyaaMirror>(
    () => nyaaMirrors.find((candidate) => candidate.host === settings.value.mirror) ?? nyaaMirrors[0],
  );

  const activeFilterCount = computed<number>(() => countActiveFilters(settings.value.filters));

  /**
   * Opens a nyaa page in a new tab, where the browser gets past nyaa's Cloudflare check.
   * @param url - The page.
   * @returns void
   */
  const openInNewTab = (url: string): void => {
    window.open(url, '_blank', 'noopener');
  };

  /**
   * Opens the search on the picked mirror, with the filters' own nyaa params.
   * @returns void
   */
  const openSearch = (): void => {
    const params = getFilterParams((search.value ?? '').trim(), settings.value.filters);
    openInNewTab(getNyaaSearchUrl(mirror.value.url, params, settings.value.sort));
  };

  /**
   * Opens a mirror's home page without picking it.
   * @param mirrorToOpen - The mirror.
   * @returns void
   */
  const openMirror = (mirrorToOpen: NyaaMirror): void => {
    openInNewTab(mirrorToOpen.url);
  };

  /**
   * Clears every filter, which searches every category.
   * @returns void
   */
  const clearFilters = (): void => {
    settings.value.filters = createEmptyFilters();
  };

  watchDebounced(
    search,
    (value) => {
      const term = (value ?? '').trim();
      if (term === (getQueryString(route.query.q) ?? '')) {
        return;
      }

      // A new term starts the other tabs' searches over, so their page number goes too
      void router.replace({ query: { ...route.query, q: term || undefined, page: undefined } });
    },
    { debounce: 300 },
  );

  return { search, settings, mirror, activeFilterCount, clearFilters, openSearch, openMirror };
};
