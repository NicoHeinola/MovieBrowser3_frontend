<script setup lang="ts">
import type { MalSearchDialogProps } from './malSearchDialogProps';
import type { MalAnime } from '@/interfaces/api/models/MalAnime';
import type { ListResponse } from '@/interfaces/api/responses/ListResponse';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BaseDialog } from '@/components/common/base-dialog';
import { CoverListItem } from '@/components/common/cover-list-item';
import { SearchResultList } from '@/components/common/search-result-list';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useDebouncedSearch } from '@/composables/search/useDebouncedSearch';
import { MalQueryKey } from '@/enums/query/malQueryKey';
import { malAnimeService } from '@/services/mal/malAnimeService';

const props = defineProps<MalSearchDialogProps>();

const isDialogVisible = defineModel<boolean>({ required: true });

const { search, term, debouncedTerm, isWaiting } = useDebouncedSearch(props.initialSearch ?? '');
const { t } = useI18n();

const animeQuery = useAPIQuery<ListResponse<MalAnime>>({
  queryKey: [MalQueryKey.SearchDialogAnime, debouncedTerm],
  queryFn: async () => await malAnimeService.list(debouncedTerm.value),
  enabled: computed<boolean>(() => debouncedTerm.value !== ''),
  placeholderData: (previousData) => previousData,
});

const anime = computed<MalAnime[]>(() => animeQuery.data.value?.data ?? []);
/** A failed search leaves the list empty; the error snackbar explains it, so it doesn't claim there's no match. */
const hasFailed = computed<boolean>(() => animeQuery.isError.value);
/** Loading while the typed term waits for the debounce too, so the old results don't pass for the new term's. */
const isLoading = computed<boolean>(() => term.value !== '' && (isWaiting.value || animeQuery.isFetching.value));

/**
 * The details under an anime's name, such as "TV, 2022, Finished Airing, Score 8.40", leaving out what MAL doesn't
 * know.
 * @param item - The anime.
 * @returns The details, comma-separated.
 */
const getDetails = (item: MalAnime): string =>
  [item.media_type, item.start_year, item.status, item.score ? t('mal.score', { score: item.score }) : null]
    .filter((detail) => detail !== null && detail !== '')
    .join(', ');

/**
 * Opens an anime's MAL page in a new tab, to check it's the right season before picking it.
 * @param item - The anime.
 * @returns Nothing.
 */
const openAnime = (item: MalAnime): void => {
  window.open(item.url, '_blank', 'noopener');
};
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="560px">
    <template #title> {{ t('mal.searchTitle') }} </template>

    <template #default>
      <div class="d-flex flex-column ga-4">
        <v-text-field
          v-model="search"
          :label="t('mal.searchLabel')"
          prepend-inner-icon="mdi-magnify"
          autofocus
          clearable
        />

        <!-- Nothing below the field until a name is typed. A failed search shows only the error snackbar, not a claim
           that nothing matches. -->
        <search-result-list
          :empty-text="hasFailed ? undefined : t('mal.noMatch')"
          :is-empty="anime.length === 0"
          :loading="isLoading"
          v-if="term !== ''"
        >
          <cover-list-item
            v-for="item in anime"
            :image-url="item.image_url"
            :subtitle="getDetails(item)"
            :title="item.title"
            @click="props.close(item)"
            :key="item.id"
          >
            <template #append>
              <v-btn
                icon="mdi-open-in-new"
                size="small"
                variant="text"
                @click.stop="openAnime(item)"
                v-tooltip:bottom="t('mal.open')"
              />
            </template>
          </cover-list-item>
        </search-result-list>
      </div>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
    </template>
  </base-dialog>
</template>
