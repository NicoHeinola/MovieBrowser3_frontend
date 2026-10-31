<script setup lang="ts">
import type { ShowSearchFilters } from '@/composables/show/ShowSearchFilters';
import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { SectionLabel } from '@/components/common/section-label';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { categoryService } from '@/services/show/categoryService';
import { getWatchStatusColor } from '@/utils/show/getWatchStatusColor';
import { getWatchStatusIcon } from '@/utils/show/getWatchStatusIcon';
import ShowFilterChip from './ShowFilterChip.vue';

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

const resultLabel = computed<string>(() => {
  return `Show ${props.totalResults} result${props.totalResults === 1 ? '' : 's'}`;
});

/**
 * Resolves whether a value is included, excluded or not filtered on.
 * @param included - The included values.
 * @param excluded - The excluded values.
 * @param value - The value to look up.
 * @returns The value's filter state.
 */
const getFilterState = <T,>(included: T[], excluded: T[], value: T): 'include' | 'exclude' | null => {
  if (included.includes(value)) return 'include';
  if (excluded.includes(value)) return 'exclude';
  return null;
};

/**
 * Adds a value to or removes it from a list without duplicating it.
 * @param values - The current values.
 * @param value - The value to add or remove.
 * @param isAdded - Whether the value should be in the list.
 * @returns The updated values.
 */
const toggleValue = <T,>(values: T[], value: T, isAdded: boolean): T[] => {
  const otherValues = values.filter((existingValue) => existingValue !== value);
  return isAdded ? [...otherValues, value] : otherValues;
};

/**
 * Includes, excludes or stops filtering on a watch status.
 * @param status - The watch status.
 * @param state - The new filter state.
 * @returns void
 */
const setWatchStatusState = (status: WatchStatus, state: 'include' | 'exclude' | null): void => {
  updateFilters({
    watchStatuses: toggleValue(filters.value.watchStatuses, status, state === 'include'),
    excludedWatchStatuses: toggleValue(filters.value.excludedWatchStatuses, status, state === 'exclude'),
  });
};

/**
 * Includes, excludes or stops filtering on a category.
 * @param value - The category value.
 * @param state - The new filter state.
 * @returns void
 */
const setCategoryState = (value: string, state: 'include' | 'exclude' | null): void => {
  updateFilters({
    categories: toggleValue(filters.value.categories, value, state === 'include'),
    excludedCategories: toggleValue(filters.value.excludedCategories, value, state === 'exclude'),
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
  <v-navigation-drawer
    v-model="isShown"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    width="470"
    temporary
  >
    <v-container>
      <v-row align="center">
        <v-col cols="auto">
          <v-sheet border="white sm" class="px-2 py-1" color="surface" rounded="lg">
            <v-icon color="primary" size="small">mdi-tune-variant</v-icon>
          </v-sheet>
        </v-col>
        <v-col>
          <h2>Filters</h2>
        </v-col>
        <v-col cols="auto">
          <v-btn color="default" icon="mdi-close" variant="text" @click="isShown = false" />
        </v-col>
      </v-row>
    </v-container>

    <v-divider />

    <v-container>
      <v-row>
        <v-col cols="12">
          <v-row gap="12">
            <v-col cols="12">
              <section-label title="Watch status">
                <template #subtitle>
                  Matches <span class="text-primary">any</span> included, <span class="text-error">none</span> excluded.
                </template>
              </section-label>
            </v-col>
            <v-col class="d-flex flex-wrap ga-3" cols="12">
              <show-filter-chip
                v-for="status in watchStatuses"
                :color="getWatchStatusColor(status)"
                :icon="getWatchStatusIcon(status)"
                :model-value="getFilterState(filters.watchStatuses, filters.excludedWatchStatuses, status)"
                :text="t(`showEntry.watchStatus.${status}`)"
                @update:model-value="setWatchStatusState(status, $event)"
                :key="status"
              />
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-row gap="12">
            <v-col cols="12">
              <section-label title="Categories">
                <template #subtitle>
                  Matches <span class="text-primary">every</span> included,
                  <span class="text-error">none</span> excluded.
                </template>
              </section-label>
            </v-col>
            <v-col cols="12" v-if="categoriesQuery.isPending.value">
              <v-skeleton-loader class="bg-transparent" type="chip@6" />
            </v-col>
            <v-col class="d-flex flex-wrap ga-3" cols="12" v-else-if="categories.length > 0">
              <show-filter-chip
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
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-row gap="12">
            <v-col cols="12">
              <section-label title="Preview" />
            </v-col>
            <v-col cols="12">
              <v-switch
                :model-value="filters.hasPreview"
                label="Only shows with a preview"
                @update:model-value="updateFilters({ hasPreview: $event === true })"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <template #append>
      <v-divider />
      <v-container>
        <v-row density="compact">
          <v-col cols="auto">
            <v-btn
              :disabled="props.activeFilterCount === 0"
              color="default"
              prepend-icon="mdi-filter-off-outline"
              variant="text"
              @click="emit('clear')"
            >
              Clear
            </v-btn>
          </v-col>
          <v-col>
            <v-btn :loading="props.isLoading" variant="flat" block @click="isShown = false">
              {{ resultLabel }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-navigation-drawer>
</template>
