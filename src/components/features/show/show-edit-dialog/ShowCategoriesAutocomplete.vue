<script setup lang="ts">
import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { computed } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { categoryService } from '@/services/show/categoryService';

const selectedCategories = defineModel<Category[]>('categories', {
  default: (_props) => [],
});

const categoriesQuery = useAPIQuery<PaginatedResponse<Category>>({
  queryKey: [CategoryQueryKey.ShowCategoriesAutocomplete],
  queryFn: async () => {
    return await categoryService.list({
      sort: '-name',
      page: {
        number: 1,
        size: 0,
      },
    });
  },
  placeholderData: (previousData) => previousData,
});

const categories = computed<Category[]>(() => {
  return categoriesQuery.data.value?.data ?? [];
});
</script>

<template>
  <v-autocomplete
    v-model="selectedCategories"
    :items="categories"
    :loading="categoriesQuery.isFetching.value"
    item-title="name"
    item-value="id"
    label="Categories"
    chips
    closable-chips
    multiple
    return-object
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :prepend-icon="item.icon" :subtitle="item.value" :title="item.name" />
    </template>
  </v-autocomplete>
</template>
