<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SearchFilterDrawer } from '@/components/common/filter-drawer';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { ResultCount } from '@/components/common/result-count';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { ShowGrid } from '@/components/features/show/show-grid';
import { showSearchFilterDefinitions } from '@/composables/show/showSearchFilterDefinitions';
import { showSortOptions } from '@/composables/show/showSortOptions';
import { useShowEditDialog } from '@/composables/show/useShowEditDialog';
import { useShowSearch } from '@/composables/show/useShowSearch';
import { ShowQueryKey } from '@/enums/query/showQueryKey';

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
} = useShowSearch(ShowQueryKey.AdminShows);

const { openShowEditDialog } = useShowEditDialog();
const { t } = useI18n();
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
            @click:show="openShowEditDialog"
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
  <floating-action-button class="z-100" icon="mdi-plus" @click="openShowEditDialog()" />

  <search-filter-drawer
    v-model:filters="filters"
    v-model:is-shown="isFilterDrawerVisible"
    :active-filter-count="activeFilterCount"
    :definitions="showSearchFilterDefinitions"
    :is-loading="isLoading"
    :total-results="totalResults"
    @clear="clearFilters"
  />
</template>
