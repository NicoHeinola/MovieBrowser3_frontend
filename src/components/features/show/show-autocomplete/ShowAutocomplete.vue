<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { refDebounced } from '@vueuse/core';
import { computed, ref } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';

const props = withDefaults(
  defineProps<{
    excludeIds?: number[];
    label?: string;
  }>(),
  {
    excludeIds: () => [],
    label: 'Show',
  },
);

const selectedShow = defineModel<Show | null>({
  default: null,
});

const search = ref<string>('');
const debouncedSearch = refDebounced(search, 300);

const showsQuery = useAPIQuery<PaginatedResponse<Show>>({
  queryKey: computed(() => [ShowQueryKey.ShowAutocomplete, debouncedSearch.value.trim()]),
  queryFn: async () => {
    const searchTerm = debouncedSearch.value.trim();

    return await showService.list({
      filter: searchTerm ? { search: searchTerm } : undefined,
      sort: '-created_at',
      page: {
        number: 1,
        size: 25,
      },
    });
  },
  placeholderData: (previousData) => previousData,
});

const availableShows = computed<Show[]>(() => {
  const shows = showsQuery.data.value?.data ?? [];

  return shows.filter((show) => !props.excludeIds.includes(show.id));
});

const getShowTitle = (show: Show): string => {
  return getPrimaryTitle(show);
};
</script>

<template>
  <v-autocomplete
    v-model="selectedShow"
    v-model:search="search"
    :item-title="getShowTitle"
    :item-value="(show: Show) => show.id"
    :items="availableShows"
    :label="props.label"
    :loading="showsQuery.isFetching.value"
    :no-data-text="search.trim() ? 'No matching shows found' : 'No shows available'"
    return-object
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="getShowTitle(item)" />
    </template>

    <template #selection="{ item }">
      <span>{{ getShowTitle(item) }}</span>
    </template>
  </v-autocomplete>
</template>
