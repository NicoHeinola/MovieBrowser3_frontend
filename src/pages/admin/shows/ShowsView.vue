<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { AdminShowSearchFilters } from '@/interfaces/show/AdminShowSearchFilters';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { SearchFilterDrawer } from '@/components/common/filter-drawer';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { ResultCount } from '@/components/common/result-count';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { ShowGrid, ShowGridSkeleton } from '@/components/features/show/show-grid';
import { useShowSearch } from '@/composables/show/useShowSearch';
import { adminShowSearchFilterDefinitions } from '@/data/show/adminShowSearchFilterDefinitions';
import { showSortOptions } from '@/data/show/showSortOptions';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { SHOW_GRID_CARD_SIZE } from '@/utils/show/show-grid/showGridCardSize';

const isFilterDrawerVisible = ref<boolean>(false);

const {
  searchInput,
  filters,
  activeFilterCount,
  clearFilters,
  sort,
  page,
  shows,
  pageSize,
  gridStyle,
  totalPages,
  totalResults,
  isLoading,
} = useShowSearch<AdminShowSearchFilters>(ShowQueryKey.AdminShows, {}, adminShowSearchFilterDefinitions);

const router = useRouter();
const { t } = useI18n();

/**
 * Opens the show editor on a show, or on a new show.
 * @param show - The show to edit; leave it out to add a show.
 * @returns Nothing.
 */
const editShow = async (show?: Show | null): Promise<void> => {
  await router.push(show ? { name: 'admin-show-edit', params: { showId: show.id } } : { name: 'admin-show-new' });
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

    <show-grid-skeleton :count="pageSize" :grid-style="gridStyle" v-if="isLoading" />

    <template v-else>
      <v-row justify="center" v-if="shows.length > 0">
        <v-col class="d-flex justify-center" cols="12">
          <show-grid
            :card-height="SHOW_GRID_CARD_SIZE.height"
            :card-width="SHOW_GRID_CARD_SIZE.width"
            :shows="shows"
            :style="gridStyle"
            class="d-flex justify-center flex-0-0"
            @click:show="void editShow($event)"
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
  <floating-action-button class="z-100" icon="mdi-plus" @click="void editShow()" />

  <search-filter-drawer
    v-model:filters="filters"
    v-model:is-shown="isFilterDrawerVisible"
    :active-filter-count="activeFilterCount"
    :definitions="adminShowSearchFilterDefinitions"
    :is-loading="isLoading"
    :total-results="totalResults"
    @clear="clearFilters"
  />
</template>
