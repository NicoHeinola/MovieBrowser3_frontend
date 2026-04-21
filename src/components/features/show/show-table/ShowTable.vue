<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import type { DataTableHeader } from 'vuetify';

import { computed, ref, useSlots, watch } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';
import { getPrimaryShowTitle } from '@/utils/show/getPrimaryShowTitle';

const props = withDefaults(
  defineProps<{
    filters?: ApiQueryParams['filter'];
    sort?: string;
    itemsPerPage?: number;
  }>(),
  {
    filters: undefined,
    sort: '-created_at',
    itemsPerPage: 10,
  },
);

defineSlots<{
  actions: (props: { show: Show }) => unknown;
}>();

const page = ref<number>(1);
const slots = useSlots();

const showsQuery = useAPIQuery<PaginatedResponse<Show>>({
  queryKey: computed(() => [
    ShowQueryKey.AdminShows,
    'table',
    props.filters,
    props.sort,
    page.value,
    props.itemsPerPage,
  ]),
  queryFn: async () => {
    return await showService.list({
      filter: props.filters,
      sort: props.sort,
      page: {
        number: page.value,
        size: props.itemsPerPage,
      },
    });
  },
  placeholderData: (previousData) => previousData,
});

const headers = computed<Array<DataTableHeader>>(() => {
  const baseHeaders: Array<DataTableHeader> = [
    {
      title: 'Poster',
      key: 'image',
      sortable: false,
      width: 88,
    },
    {
      title: 'Title',
      key: 'title',
      sortable: false,
    },
    {
      title: 'Preview',
      key: 'hasPreview',
      align: 'end',
      sortable: false,
      width: 120,
    },
  ];

  if (slots.actions) {
    baseHeaders.push({
      title: 'Actions',
      key: 'actions',
      align: 'end',
      sortable: false,
      width: 120,
    });
  }

  return baseHeaders;
});

const items = computed<
  Array<{
    id: number;
    image: string;
    title: string;
    hasPreview: boolean;
    show: Show;
  }>
>(() => {
  return (showsQuery.data.value?.data ?? []).map((show: Show) => ({
    id: show.id,
    image: show.card_image_url,
    title: getPrimaryShowTitle(show),
    hasPreview: !!show.preview_url,
    show,
  }));
});

const totalItems = computed<number>(() => showsQuery.data.value?.meta.total ?? 0);

watch(
  () => [props.filters, props.sort, props.itemsPerPage],
  () => {
    page.value = 1;
  },
  {
    deep: true,
  },
);
</script>

<template>
  <v-data-table-server
    v-model:page="page"
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :items-per-page="props.itemsPerPage"
    :loading="showsQuery.isFetching.value"
    class="show-table"
    item-value="id"
  >
    <template #item.image="{ value }">
      <v-img :src="value" height="80" rounded="lg" width="56" cover />
    </template>

    <template #item.title="{ value, item }">
      <div class="py-2">
        <p class="mb-1 font-weight-medium text-truncate">{{ value }}</p>
        <p class="mb-0 text-body-2 text-medium-emphasis">#{{ item.id }}</p>
      </div>
    </template>

    <template #item.hasPreview="{ value }">
      <v-chip :color="value ? 'success' : 'default'" size="small" variant="tonal">
        {{ value ? 'Available' : 'None' }}
      </v-chip>
    </template>

    <template #item.actions="{ item }" v-if="slots.actions">
      <div class="d-flex justify-end">
        <slot :show="item.show" name="actions" />
      </div>
    </template>

    <template #no-data> No shows available. </template>
  </v-data-table-server>
</template>

<style scoped lang="scss">
.show-table {
  :deep(table) {
    table-layout: fixed;
    width: 100%;
  }
}
</style>
