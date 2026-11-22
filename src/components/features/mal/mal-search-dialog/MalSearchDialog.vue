<script setup lang="ts">
import type { MalSearchDialogProps } from './malSearchDialogProps';
import type { MalAnime } from '@/interfaces/api/models/MalAnime';
import type { ListResponse } from '@/interfaces/api/responses/ListResponse';

import { refDebounced } from '@vueuse/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BaseDialog } from '@/components/common/base-dialog';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { MalQueryKey } from '@/enums/query/malQueryKey';
import { malAnimeService } from '@/services/mal/malAnimeService';

const props = defineProps<MalSearchDialogProps>();

const isDialogVisible = defineModel<boolean>({ required: true });

const search = ref<string>(props.initialSearch ?? '');
const debouncedSearch = refDebounced(search, 300);

const term = computed<string>(() => (search.value ?? '').trim());
const debouncedTerm = computed<string>(() => (debouncedSearch.value ?? '').trim());

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
const isLoading = computed<boolean>(
  () => term.value !== '' && (term.value !== debouncedTerm.value || animeQuery.isFetching.value),
);

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
      <v-text-field
        v-model="search"
        :label="t('mal.searchLabel')"
        prepend-inner-icon="mdi-magnify"
        autofocus
        clearable
        hide-details
      />

      <!-- Nothing below the field until a name is typed -->
      <template v-if="term !== ''">
        <!-- A failed search shows only the error snackbar, not a claim that nothing matches -->
        <div class="d-flex justify-center mt-4" v-if="!isLoading && anime.length === 0 && !hasFailed">
          <v-alert class="flex-0-1" type="info" variant="tonal">{{ t('mal.noMatch') }}</v-alert>
        </div>

        <v-list bg-color="transparent" class="mt-2 overflow-y-auto" style="max-height: 440px" v-else-if="!hasFailed">
          <template v-if="isLoading">
            <v-skeleton-loader v-for="i in 3" color="transparent" type="list-item-avatar" :key="i" />
          </template>

          <template v-else>
            <v-list-item
              v-for="item in anime"
              :subtitle="getDetails(item)"
              :title="item.title"
              @click="props.close(item)"
              :key="item.id"
            >
              <template #prepend>
                <v-img :src="item.image_url ?? undefined" class="me-4" height="52" rounded="sm" width="36" cover />
              </template>

              <template #append>
                <v-btn
                  icon="mdi-open-in-new"
                  size="small"
                  variant="text"
                  @click.stop="openAnime(item)"
                  v-tooltip:bottom="t('mal.open')"
                />
              </template>
            </v-list-item>
          </template>
        </v-list>
      </template>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
    </template>
  </base-dialog>
</template>
