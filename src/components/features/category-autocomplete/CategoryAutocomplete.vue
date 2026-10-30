<script setup lang="ts" generic="T">
import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { computed, useAttrs } from 'vue';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { categoryService } from '@/services/show/categoryService';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    label?: string;
    /** Category ids shown but not selectable, e.g. ones already taken elsewhere. */
    disabledIds?: number[];
  }>(),
  {
    label: 'Category',
    disabledIds: () => [],
  },
);

const selected = defineModel<T>();

const attrs = useAttrs();

const categoriesQuery = useAPIQuery<PaginatedResponse<Category>>({
  queryKey: [CategoryQueryKey.CategoryAutocomplete],
  queryFn: async () => {
    return await categoryService.list({
      sort: 'name',
      page: { number: 0, size: 0 },
    });
  },
  placeholderData: (previousData) => previousData,
});

const categories = computed<Category[]>(() => categoriesQuery.data.value?.data ?? []);
</script>

<template>
  <v-autocomplete
    v-model="selected"
    :items="categories"
    :label="props.label"
    :loading="categoriesQuery.isFetching.value"
    item-title="name"
    item-value="id"
    v-bind="attrs"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item
        v-bind="itemProps"
        :disabled="props.disabledIds.includes(item.id)"
        :prepend-icon="item.icon"
        :subtitle="item.value"
        :title="item.name"
      />
    </template>
  </v-autocomplete>
</template>
