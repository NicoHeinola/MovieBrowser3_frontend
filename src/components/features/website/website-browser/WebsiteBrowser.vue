<script setup lang="ts">
import type { Website } from '@/interfaces/api/models/Website';

import { useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { ResultCount } from '@/components/common/result-count';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useWebsiteSearch } from '@/composables/website/useWebsiteSearch';
import { websiteSortOptions } from '@/composables/website/websiteSortOptions';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { deepClone } from '@/utils/clone/deepClone';
import { WebsiteCard } from '../website-card';
import { WebsiteEditDialog } from '../website-edit-dialog';
import { WebsiteFilterDrawer } from '../website-filter-drawer';

const isFilterDrawerVisible = ref<boolean>(false);

const {
  searchInput,
  filters,
  activeFilterCount,
  clearFilters,
  toggleTag,
  sort,
  page,
  query: websitesQuery,
  websites,
  totalPages,
  totalResults,
  isLoading,
} = useWebsiteSearch();

const dialog = useDialog();
const queryClient = useQueryClient();

const getEmptyWebsite = (): Website => {
  return {
    id: 0,
    url: '',
    title: null,
    icon: null,
    description: null,
    tags: [],
    created_at: '',
    updated_at: '',
  };
};

const openEditWebsiteDialog = async (website?: Website): Promise<void> => {
  const refresh = await dialog.showDialog({
    component: WebsiteEditDialog,
    props: {
      website: website ? deepClone(website) : getEmptyWebsite(),
    },
  });

  if (refresh) {
    /** Tag names and counts follow the websites. */
    await Promise.all([
      websitesQuery.refetch(),
      ...Object.values(WebsiteTagQueryKey).map((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
    ]);
  }
};

/**
 * Lists only the websites using a tag, clearing the search and other filters.
 * @param tagId - The tag id.
 * @returns void
 */
const showWebsitesWithTag = (tagId: number): void => {
  searchInput.value = '';
  filters.value = { tagIds: [tagId], excludedTagIds: [] };
};

defineExpose({
  showWebsitesWithTag,
});
</script>

<template>
  <search-toolbar
    v-model:search="searchInput"
    v-model:sort="sort"
    :active-filter-count="activeFilterCount"
    :sort-options="websiteSortOptions"
    placeholder="Search websites..."
    @click:filters="isFilterDrawerVisible = true"
  />

  <v-row v-if="isLoading">
    <v-col v-for="n in 8" cols="12" lg="4" sm="6" xl="3" :key="n">
      <v-skeleton-loader type="list-item-avatar-two-line, paragraph, chip" />
    </v-col>
  </v-row>

  <template v-else>
    <result-count :count="totalResults" v-if="websites.length > 0" />

    <v-row v-if="websites.length > 0">
      <v-col v-for="website in websites" cols="12" lg="4" sm="6" xl="3" :key="website.id">
        <website-card
          :included-tag-ids="filters.tagIds"
          :website="website"
          @click:tag="toggleTag"
          @edit="openEditWebsiteDialog"
        />
      </v-col>
    </v-row>

    <v-row justify="center" v-else>
      <v-col class="d-flex justify-center" cols="12">
        <v-alert class="flex-0-1" type="info" v-if="activeFilterCount > 0">
          No websites match these filters
          <template #append>
            <v-btn color="info" size="small" variant="text" @click="clearFilters">Clear filters</v-btn>
          </template>
        </v-alert>
        <v-alert class="flex-0-1" type="info" v-else> No websites found </v-alert>
      </v-col>
    </v-row>
  </template>

  <floating-pagination v-model:page="page" :length="totalPages" class="mb-6" />
  <floating-action-button class="z-100" icon="mdi-plus" @click="openEditWebsiteDialog()" />

  <website-filter-drawer
    v-model:filters="filters"
    v-model:is-shown="isFilterDrawerVisible"
    :active-filter-count="activeFilterCount"
    :is-loading="isLoading"
    :total-results="totalResults"
    @clear="clearFilters"
  />
</template>
