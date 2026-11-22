<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useWebsiteTagSearch } from '@/composables/website/useWebsiteTagSearch';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { WebsiteTagCreateDialog } from '../website-tag-create-dialog';
import { WebsiteTagTable } from '../website-tag-table';

const emit = defineEmits<{
  /** The websites count of a tag was clicked, to list the websites using it. */
  'click:websites': [tagId: number];
}>();

const dialog = useDialog();
const queryClient = useQueryClient();
const { t } = useI18n();
const { searchInput, searchTerm, sort, page, query, tags, totalPages, isLoading } = useWebsiteTagSearch();

/** Whether the shown tags are search results; follows the debounced term, so the empty text matches the rows. */
const isSearching = computed<boolean>(() => searchTerm.value !== '');

const openCreateTagDialog = async (): Promise<void> => {
  const refresh = await dialog.showDialog({
    component: WebsiteTagCreateDialog,
    props: {},
  });

  if (refresh) {
    await queryClient.invalidateQueries(getQueryKeyFilter(WebsiteTagQueryKey));
  }
};
</script>

<template>
  <search-toolbar v-model:search="searchInput" :placeholder="t('website.searchTags')" />

  <v-row justify="center">
    <v-col cols="12" lg="8" md="10" xl="6">
      <website-tag-table
        v-model:sort="sort"
        :is-pending="query.isPending.value"
        :is-searching="isSearching"
        :loading="isLoading"
        :tags="tags"
        @click:websites="emit('click:websites', $event)"
      />
    </v-col>
  </v-row>

  <floating-pagination v-model:page="page" :length="totalPages" class="mb-6" />

  <floating-action-button class="z-100" icon="mdi-plus" @click="openCreateTagDialog" />
</template>
