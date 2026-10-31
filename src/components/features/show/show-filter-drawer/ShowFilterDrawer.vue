<script setup lang="ts">
import type { FilterChipState } from '@/components/common/filter-chip';
import type { ShowSearchFilters } from '@/composables/show/ShowSearchFilters';
import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { FilterChip } from '@/components/common/filter-chip';
import { FilterDrawer, FilterDrawerSection } from '@/components/common/filter-drawer';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { categoryService } from '@/services/show/categoryService';
import { getFilterState } from '@/utils/filter/getFilterState';
import { toggleFilterValue } from '@/utils/filter/toggleFilterValue';
import { getWatchStatusColor } from '@/utils/show/getWatchStatusColor';
import { getWatchStatusIcon } from '@/utils/show/getWatchStatusIcon';

const props = defineProps<{
  activeFilterCount: number;
  totalResults: number;
  isLoading: boolean;
}>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const filters = defineModel<ShowSearchFilters>('filters', { required: true });

const emit = defineEmits<{
  clear: [];
}>();

const watchStatuses = Object.values(WatchStatus);

const { t } = useI18n();

const categoriesQuery = useAPIQuery<PaginatedResponse<Category>>({
  queryKey: [CategoryQueryKey.ShowFilterCategories],
  queryFn: async () => {
    return await categoryService.list({
      sort: 'name',
      page: { number: 0, size: 0 },
    });
  },
  placeholderData: (previousData) => previousData,
});

const categories = computed<Category[]>(() => categoriesQuery.data.value?.data ?? []);

/**
 * Includes, excludes or stops filtering on a watch status.
 * @param status - The watch status.
 * @param state - The new filter state.
 * @returns void
 */
const setWatchStatusState = (status: WatchStatus, state: FilterChipState): void => {
  updateFilters({
    watchStatuses: toggleFilterValue(filters.value.watchStatuses, status, state === 'include'),
    excludedWatchStatuses: toggleFilterValue(filters.value.excludedWatchStatuses, status, state === 'exclude'),
  });
};

/**
 * Includes, excludes or stops filtering on a category.
 * @param value - The category value.
 * @param state - The new filter state.
 * @returns void
 */
const setCategoryState = (value: string, state: FilterChipState): void => {
  updateFilters({
    categories: toggleFilterValue(filters.value.categories, value, state === 'include'),
    excludedCategories: toggleFilterValue(filters.value.excludedCategories, value, state === 'exclude'),
  });
};

/**
 * Replaces the filters with a copy that has the given fields changed.
 * @param changes - The filter fields to change.
 * @returns void
 */
const updateFilters = (changes: Partial<ShowSearchFilters>): void => {
  filters.value = { ...filters.value, ...changes };
};
</script>

<template>
  <filter-drawer
    v-model:is-shown="isShown"
    :active-filter-count="props.activeFilterCount"
    :is-loading="props.isLoading"
    :total-results="props.totalResults"
    @clear="emit('clear')"
  >
    <filter-drawer-section title="Watch status">
      <template #subtitle>
        Matches <span class="text-primary">any</span> included, <span class="text-error">none</span> excluded.
      </template>
      <v-col class="d-flex flex-wrap ga-3" cols="12">
        <filter-chip
          v-for="status in watchStatuses"
          :color="getWatchStatusColor(status)"
          :icon="getWatchStatusIcon(status)"
          :model-value="getFilterState(filters.watchStatuses, filters.excludedWatchStatuses, status)"
          :text="t(`showEntry.watchStatus.${status}`)"
          @update:model-value="setWatchStatusState(status, $event)"
          :key="status"
        />
      </v-col>
    </filter-drawer-section>

    <filter-drawer-section title="Categories">
      <template #subtitle>
        Matches <span class="text-primary">every</span> included, <span class="text-error">none</span> excluded.
      </template>
      <v-col cols="12" v-if="categoriesQuery.isPending.value">
        <v-skeleton-loader class="bg-transparent" type="chip@6" />
      </v-col>
      <v-col class="d-flex flex-wrap ga-3" cols="12" v-else-if="categories.length > 0">
        <filter-chip
          v-for="category in categories"
          :icon="category.icon"
          :model-value="getFilterState(filters.categories, filters.excludedCategories, category.value)"
          :text="category.name"
          @update:model-value="setCategoryState(category.value, $event)"
          :key="category.id"
        />
      </v-col>
      <v-col cols="12" v-else>
        <p class="text-body-small text-disabled">No categories yet.</p>
      </v-col>
    </filter-drawer-section>

    <filter-drawer-section title="Preview">
      <v-col cols="12">
        <v-switch
          :model-value="filters.hasPreview"
          label="Only shows with a preview"
          @update:model-value="updateFilters({ hasPreview: $event === true })"
        />
      </v-col>
    </filter-drawer-section>
  </filter-drawer>
</template>
