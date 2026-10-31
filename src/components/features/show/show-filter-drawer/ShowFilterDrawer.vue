<script setup lang="ts">
import type { ShowSearchFilters } from '@/composables/show/ShowSearchFilters';
import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { categoryService } from '@/services/show/categoryService';
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

const resultLabel = computed<string>(() => {
  return `Show ${props.totalResults} result${props.totalResults === 1 ? '' : 's'}`;
});

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
    width="380"
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
      <v-row gap="12">
        <v-col cols="12">
          <p class="text-label-medium text-medium-emphasis text-uppercase">Watch status</p>
          <p class="text-body-small text-medium-emphasis">
            Shows where <span class="text-primary">any</span> entry has a selected status.
          </p>
          <v-chip-group
            :model-value="filters.watchStatuses"
            column
            multiple
            @update:model-value="updateFilters({ watchStatuses: $event })"
          >
            <v-chip
              v-for="status in watchStatuses"
              :color="getWatchStatusColor(status)"
              :prepend-icon="getWatchStatusIcon(status)"
              :text="t(`showEntry.watchStatus.${status}`)"
              :value="status"
              filter
              :key="status"
            />
          </v-chip-group>
        </v-col>

        <v-col cols="12">
          <p class="text-label-medium text-medium-emphasis text-uppercase">Categories</p>
          <p class="text-body-small text-medium-emphasis">
            Shows must have <span class="text-primary">every</span> selected category.
          </p>
          <v-skeleton-loader class="bg-transparent" type="chip@6" v-if="categoriesQuery.isPending.value" />
          <v-chip-group
            :model-value="filters.categories"
            color="primary"
            column
            multiple
            @update:model-value="updateFilters({ categories: $event })"
            v-else-if="categories.length > 0"
          >
            <v-chip
              v-for="category in categories"
              :prepend-icon="category.icon"
              :text="category.name"
              :value="category.value"
              filter
              :key="category.id"
            />
          </v-chip-group>
          <p class="text-body-small text-disabled" v-else>No categories yet.</p>
        </v-col>

        <v-col cols="12">
          <p class="text-label-medium text-medium-emphasis text-uppercase">Preview</p>
          <v-switch
            :model-value="filters.hasPreview"
            label="Only shows with a preview"
            @update:model-value="updateFilters({ hasPreview: $event === true })"
          />
        </v-col>
      </v-row>
    </v-container>

    <template #append>
      <v-divider />
      <v-container>
        <v-row dense>
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
