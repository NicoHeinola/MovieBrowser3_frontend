<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SearchFilterDrawer } from '@/components/common/filter-drawer';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { ResultCount } from '@/components/common/result-count';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowGrid } from '@/components/features/show/show-grid';
import { showSearchFilterDefinitions } from '@/composables/show/showSearchFilterDefinitions';
import { showSortOptions } from '@/composables/show/showSortOptions';
import { useShowSearch } from '@/composables/show/useShowSearch';
import { ShowQueryKey } from '@/enums/query/showQueryKey';

const { t } = useI18n();

const selectedShowId = ref<number | null>(null);
const isShowDrawerVisible = ref<boolean>(false);
const isFilterDrawerVisible = ref<boolean>(false);

const {
  searchInput,
  filters,
  activeFilterCount,
  clearFilters,
  sort,
  page,
  shows,
  totalPages,
  totalResults,
  isLoading,
} = useShowSearch(ShowQueryKey.SearchShows);

const selectShow = (show: Show | null) => {
  selectedShowId.value = show?.id ?? null;
  isShowDrawerVisible.value = true;
};
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <search-toolbar
      v-model:search="searchInput"
      v-model:sort="sort"
      :active-filter-count="activeFilterCount"
      :placeholder="t('shows.searchPlaceholder')"
      :sort-options="showSortOptions"
      @click:filters="isFilterDrawerVisible = true"
    />

    <result-count :count="totalResults" :loading="isLoading" v-if="isLoading || shows.length > 0" />

    <v-row v-if="isLoading">
      <v-col v-for="i in 16" cols="auto" :key="i">
        <v-skeleton-loader type="image" width="287" />
      </v-col>
    </v-row>

    <template v-else>
      <v-row justify="center" v-if="shows.length > 0">
        <v-col class="d-flex justify-center" cols="12">
          <show-grid
            :shows="shows"
            card-height="190"
            card-width="280"
            class="d-flex justify-center flex-1-1"
            @click:show="selectShow"
          />
        </v-col>
      </v-row>

      <v-row justify="center" v-else>
        <v-col class="d-flex justify-center" cols="12">
          <v-alert class="flex-0-1" type="info" v-if="activeFilterCount > 0">
            {{ t('shows.noMatch') }}
            <template #append>
              <v-btn color="info" size="small" variant="text" @click="clearFilters">{{
                t('common.clearFilters')
              }}</v-btn>
            </template>
          </v-alert>
          <v-alert class="flex-0-1" type="info" v-else> {{ t('shows.none') }} </v-alert>
        </v-col>
      </v-row>
    </template>
  </page-container>

  <floating-pagination v-model:page="page" :length="totalPages" class="mb-6" />

  <search-filter-drawer
    v-model:filters="filters"
    v-model:is-shown="isFilterDrawerVisible"
    :active-filter-count="activeFilterCount"
    :definitions="showSearchFilterDefinitions"
    :is-loading="isLoading"
    :total-results="totalResults"
    @clear="clearFilters"
  />

  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" v-model:show-id="selectedShowId" />
</template>
