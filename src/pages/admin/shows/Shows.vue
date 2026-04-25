<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { watchDebounced } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { FloatingPagination } from '@/components/common/floating-pagination';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { ShowEditDialog } from '@/components/features/show/show-edit-dialog';
import { ShowGrid } from '@/components/features/show/show-grid';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';
import { deepClone } from '@/utils/clone/deepClone';

const searchInput = ref<string>('');
const searchTerm = ref<string>('');
const page = ref<number>(1);
const isSearchPending = ref<boolean>(false);

const searchQuery = useAPIQuery<PaginatedResponse<Show>>({
  queryKey: [ShowQueryKey.AdminShows, searchTerm, page],
  queryFn: async () => {
    return await showService.list({
      filter: searchTerm.value ? { search: searchTerm.value } : undefined,
      sort: '-created_at',
      page: { number: page.value, size: 32 },
    });
  },
  placeholderData: (previousData) => previousData,
});

const shows = computed<Show[]>(() => searchQuery.data.value?.data ?? []);
const totalPages = computed<number>(() => searchQuery.data.value?.meta.last_page ?? 1);
const totalResults = computed<number>(() => searchQuery.data.value?.meta.total ?? 0);
const isLoading = computed<boolean>(() => isSearchPending.value || searchQuery.isFetching.value);

const dialog = useDialog();

const editShow = (show: Show | null) => {
  void dialog.showDialog({
    component: ShowEditDialog,
    props: {
      show: show
        ? deepClone(show)
        : {
            titles: [{ title: '', is_primary: true }],
          },
    },
  });
};

watch(searchInput, (value) => {
  isSearchPending.value = value.trim() !== searchTerm.value;
});

watchDebounced(
  searchInput,
  (value) => {
    searchTerm.value = value.trim();
    page.value = 1;
    isSearchPending.value = false;
  },
  {
    debounce: 300,
  },
);
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <v-row justify="center">
      <v-col class="d-flex ga-2 align-center" cols="12" lg="8" md="10" xl="6">
        <v-text-field
          v-model="searchInput"
          placeholder="Search shows..."
          prepend-inner-icon="mdi-magnify"
          rounded="xl"
          variant="solo-filled"
          clearable
        />
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col v-for="i in 16" cols="auto" :key="i">
        <v-skeleton-loader type="image" width="287" />
      </v-col>
    </v-row>

    <template v-else>
      <v-row v-if="shows.length > 0">
        <v-col cols="12">
          <p class="text-center">{{ totalResults }} result{{ totalResults !== 1 ? 's' : '' }} found</p>
        </v-col>
      </v-row>

      <v-row justify="center" v-if="shows.length > 0">
        <v-col class="d-flex justify-center" cols="12">
          <show-grid
            :shows="shows"
            card-height="190"
            card-width="280"
            class="d-flex justify-center flex-1-1"
            @click:show="editShow"
            v-if="shows.length > 0"
          />
        </v-col>
      </v-row>

      <v-row justify="center" v-else>
        <v-col class="d-flex justify-center" cols="12">
          <v-alert class="flex-0-1" type="info"> No shows found </v-alert>
        </v-col>
      </v-row>
    </template>
  </page-container>

  <floating-pagination v-model:page="page" :length="totalPages" class="mb-6" />
  <floating-action-button class="z-100" icon="mdi-plus" @click="editShow(null)" />
</template>
