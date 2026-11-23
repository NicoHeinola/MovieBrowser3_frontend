<script setup lang="ts">
import type { DownloadIntoShowDialogProps } from './downloadIntoShowDialogProps';
import type { Show } from '@/interfaces/api/models/Show';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { BaseDialog } from '@/components/common/base-dialog';
import { CoverListItem } from '@/components/common/cover-list-item';
import { SearchResultList } from '@/components/common/search-result-list';
import { DownloadCard } from '@/components/features/download/download-card';
import { ShowListItem } from '@/components/features/show/show-list-item';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useDownloadCreate } from '@/composables/download/useDownloadCreate';
import { useDebouncedSearch } from '@/composables/search/useDebouncedSearch';
import { showSortOptions } from '@/data/show/showSortOptions';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';
import { formatFileSize } from '@/utils/file/formatFileSize';

const props = defineProps<DownloadIntoShowDialogProps>();

const isDialogVisible = defineModel<boolean>({ required: true });

/** How many shows the list offers: the newest ones before a name is typed, the best matches after. */
const SHOW_COUNT = 8;

/** The picked show's id, or `'new'` for a new show; null until one is picked. */
const target = ref<number | 'new' | null>(null);

const router = useRouter();
const { search, term, debouncedTerm, isWaiting } = useDebouncedSearch();
const { create, errorMessage, isCreating } = useDownloadCreate();
const { locale, t } = useI18n();

/** The list's selection: at most the one picked target. */
const selected = computed<(number | 'new')[]>({
  get: () => (target.value === null ? [] : [target.value]),
  set: (values) => {
    target.value = values[0] ?? null;
  },
});

const showsQuery = useAPIQuery<PaginatedResponse<Show>>({
  queryKey: [ShowQueryKey.DownloadTargetShows, debouncedTerm],
  queryFn: async () =>
    await showService.list({
      // A new season usually goes into a show added lately, so those come first until a name is typed
      filter: debouncedTerm.value ? { search: debouncedTerm.value } : undefined,
      sort: debouncedTerm.value ? showSortOptions[0].value : '-created_at',
      page: { number: 1, size: SHOW_COUNT },
    }),
  placeholderData: (previousData) => previousData,
});

const shows = computed<Show[]>(() => showsQuery.data.value?.data ?? []);
/** Loading while the typed term waits for the debounce too, so the old results don't pass for the new term's. */
const isLoading = computed<boolean>(() => isWaiting.value || showsQuery.isFetching.value);

/**
 * Lists a show's category names for its subtitle, like the navigation search does.
 * @param show - The show.
 * @returns The comma-separated category names.
 */
const getCategoryNames = (show: Show): string => (show.categories ?? []).map((category) => category.name).join(', ');

/**
 * Hands the torrent to qBittorrent and opens the picked show's editor with it, where its files are picked. A failure
 * keeps the dialog open with the reason, to retry once qBittorrent is fixed.
 * @returns Nothing.
 */
const start = async (): Promise<void> => {
  if (target.value === null || isCreating.value) {
    return;
  }

  const downloadId = await create({
    magnet_url: props.torrent.magnet_url,
    torrent_url: props.torrent.torrent_url,
    name: props.torrent.title,
  });

  if (downloadId === null) {
    return;
  }

  // A new show fills itself in from the site's page of the show, when there is one
  await (target.value === 'new'
    ? router.push({
        name: 'admin-show-new',
        query: { template: props.torrent.media_url ?? undefined, download: String(downloadId) },
      })
    : router.push({
        name: 'admin-show-edit',
        params: { showId: target.value },
        query: { download: String(downloadId) },
      }));

  props.close();
};

// A picked show that drops out of the results can't be seen any more, so it can't stay picked either
watch(shows, (current) => {
  if (typeof target.value === 'number' && !current.some((show) => show.id === target.value)) {
    target.value = null;
  }
});
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="600px">
    <template #title> {{ t('download.addToShow') }} </template>

    <template #default>
      <div class="d-flex flex-column ga-4">
        <download-card :details="formatFileSize(props.torrent.size_bytes, locale)" :name="props.torrent.title" />

        <span class="text-medium-emphasis text-body-small">{{ t('download.pickShowHint') }}</span>

        <v-text-field
          v-model="search"
          :label="t('download.searchShows')"
          prepend-inner-icon="mdi-magnify"
          autofocus
          clearable
        />

        <search-result-list
          v-model:selected="selected"
          :disabled="isCreating"
          :empty-text="term === '' ? undefined : t('show.noMatchingShows')"
          :is-empty="shows.length === 0"
          :loading="isLoading"
        >
          <!-- Always first, also while shows load -->
          <template #prepend>
            <cover-list-item
              :subtitle="props.torrent.media_url ? t('download.newShowFilled') : t('download.newShowEmpty')"
              :title="t('download.newShow')"
              :value="'new'"
              class="mb-4"
              color="primary"
              icon="mdi-movie-plus-outline"
              rounded="lg"
            />
            <v-divider class="mb-4" />
          </template>

          <show-list-item
            v-for="show in shows"
            :show="show"
            :subtitle="getCategoryNames(show)"
            :value="show.id"
            color="primary"
            rounded="lg"
            :key="show.id"
          />
        </search-result-list>

        <v-alert type="error" v-if="errorMessage">{{ errorMessage }}</v-alert>
      </div>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn :disabled="isCreating" variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
      <v-btn :disabled="target === null" :loading="isCreating" color="primary" variant="flat" @click="void start()">
        {{ t('download.continue') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
