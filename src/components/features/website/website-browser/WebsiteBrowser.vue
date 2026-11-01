<script setup lang="ts">
import { ref } from 'vue';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { ResultCount } from '@/components/common/result-count';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { useWebsiteEditDialog } from '@/composables/website/useWebsiteEditDialog';
import { useWebsiteFavoriteToggle } from '@/composables/website/useWebsiteFavoriteToggle';
import { useWebsiteSearch } from '@/composables/website/useWebsiteSearch';
import { websiteSortOptions } from '@/composables/website/websiteSortOptions';
import { WebsiteCard } from '../website-card';
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
  websites,
  totalPages,
  totalResults,
  isLoading,
} = useWebsiteSearch();

const { openWebsiteEditDialog } = useWebsiteEditDialog();
const { savingFavoriteIds, toggleFavorite } = useWebsiteFavoriteToggle();

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

  <result-count :count="totalResults" :loading="isLoading" v-if="isLoading || websites.length > 0" />

  <v-row v-if="isLoading">
    <v-col v-for="n in 8" cols="12" lg="4" sm="6" xl="3" :key="n">
      <v-skeleton-loader type="list-item-avatar-two-line, paragraph, chip" />
    </v-col>
  </v-row>

  <template v-else>
    <v-row v-if="websites.length > 0">
      <v-col v-for="website in websites" cols="12" lg="4" sm="6" xl="3" :key="website.id">
        <website-card
          :included-tag-ids="filters.tagIds"
          :is-saving-favorite="savingFavoriteIds.includes(website.id)"
          :website="website"
          @click:tag="toggleTag"
          @edit="openWebsiteEditDialog"
          @toggle:favorite="toggleFavorite"
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
  <floating-action-button class="z-100" icon="mdi-plus" @click="openWebsiteEditDialog()" />

  <website-filter-drawer
    v-model:filters="filters"
    v-model:is-shown="isFilterDrawerVisible"
    :active-filter-count="activeFilterCount"
    :is-loading="isLoading"
    :total-results="totalResults"
    @clear="clearFilters"
  />
</template>
