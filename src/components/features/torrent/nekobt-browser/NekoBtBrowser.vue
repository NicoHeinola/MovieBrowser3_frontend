<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { SearchFilterDrawer } from '@/components/common/filter-drawer';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { useNekoBtTorrentSearch } from '@/composables/nekobt/useNekoBtTorrentSearch';
import { nekoBtSearchFilterDefinitions } from '@/data/nekobt/nekoBtSearchFilterDefinitions';
import { NEKOBT_URL } from '@/data/nekobt/nekoBtUrl';
import { NekoBtBadgeHelp } from '../nekobt-badge-help';
import { NekoBtTable } from '../nekobt-table';

const isFilterDrawerVisible = ref<boolean>(false);

const { searchInput, filters, activeFilterCount, clearFilters, sort, page, query, torrents, totalPages, isLoading } =
  useNekoBtTorrentSearch();
const { t } = useI18n();
</script>

<template>
  <!-- No sort menu: the table's column headers sort. -->
  <search-toolbar
    v-model:search="searchInput"
    :active-filter-count="activeFilterCount"
    :placeholder="t('torrents.nekobt.searchPlaceholder')"
    @click:filters="isFilterDrawerVisible = true"
  >
    <template #append>
      <v-btn
        :href="NEKOBT_URL"
        icon="mdi-open-in-new"
        rel="noopener"
        size="small"
        target="_blank"
        variant="tonal"
        v-tooltip:bottom="t('torrents.openSite', { site: 'nekoBT' })"
      />
    </template>
  </search-toolbar>

  <neko-bt-badge-help />

  <v-row>
    <v-col cols="12">
      <neko-bt-table
        v-model:sort="sort"
        :is-filtered="activeFilterCount > 0"
        :is-pending="query.isPending.value"
        :loading="isLoading"
        :torrents="torrents"
      />
    </v-col>
  </v-row>

  <floating-pagination v-model:page="page" :length="totalPages" class="mb-6" />

  <!-- nekoBT doesn't count its results, so the drawer's button shows none. -->
  <search-filter-drawer
    v-model:filters="filters"
    v-model:is-shown="isFilterDrawerVisible"
    :active-filter-count="activeFilterCount"
    :apply-text="t('torrents.showResults')"
    :definitions="nekoBtSearchFilterDefinitions"
    :is-loading="isLoading"
    :total-results="0"
    @clear="clearFilters"
  />
</template>
