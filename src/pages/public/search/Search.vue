<script setup lang="ts">
import type { PaginationMeta } from '@/interfaces/api/models/PaginationMeta';
import type { Show } from '@/interfaces/api/models/Show';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { computed, onMounted, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowCard } from '@/components/features/show/show-card';
import { ShowGrid } from '@/components/features/show/show-grid';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';

const searchInput = ref<string>('');
const searchTerm = ref<string>('');
const page = ref<number>(1);
const selectedShow = ref<Show | null>(null);
const isShowDrawerVisible = ref<boolean>(false);

const meta = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 24,
  total: 0,
});

const searchQuery = useAPIQuery<Partial<PaginatedResponse<Show>>>({
  queryKey: [ShowQueryKey.SearchShows, searchTerm, page],
  queryFn: async () => {
    try {
      const data = await showService.list({
        filter: searchTerm.value ? { search: searchTerm.value } : undefined,
        sort: '-created_at',
        page: { number: page.value, size: 24 },
      });

      meta.value = data.meta;

      return data;
    } catch (error) {
      meta.value = {
        current_page: 1,
        last_page: 1,
        per_page: 24,
        total: 0,
      };

      throw error;
    }
  },
  placeholderData: {
    data: [],
  },
});

const shows = computed<Show[]>(() => searchQuery.data.value?.data ?? []);
const totalPages = computed<number>(() => meta.value.last_page);
const totalResults = computed<number>(() => meta.value.total);
const isLoading = computed<boolean>(() => searchQuery.isFetching.value);

const selectShow = (show: Show | null) => {
  selectedShow.value = show;
  isShowDrawerVisible.value = true;
};

watch(searchInput, (value) => {
  searchTerm.value = value.trim();
  page.value = 1;
});
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <v-row justify="center">
      <v-col cols="12" lg="8" md="10" xl="6">
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
      <v-col v-for="i in 8" cols="auto" :key="i">
        <v-skeleton-loader type="image" width="300" />
      </v-col>
    </v-row>

    <template v-else>
      <v-row v-if="shows.length > 0">
        <v-col cols="12">
          <p class="text-center">{{ totalResults }} result{{ totalResults !== 1 ? 's' : '' }} found</p>
        </v-col>
      </v-row>

      <v-row justify="center" v-if="shows.length > 0">
        <v-col cols="12">
          <show-grid
            :cols="isLoading ? 6 : 8"
            :shows="shows"
            card-height="500"
            @click:show="selectShow"
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

  <div class="position-fixed bottom-0 left-0 w-100 mb-6" style="z-index: 100">
    <v-slide-y-reverse-transition>
      <v-row justify="center" no-gutters v-if="totalPages > 1">
        <v-col cols="12" lg="5" md="4" xl="3">
          <v-sheet class="glass-panel" elevation="2" rounded="xl" border>
            <v-pagination v-model="page" :length="totalPages" density="comfortable" variant="text" />
          </v-sheet>
        </v-col>
      </v-row>
    </v-slide-y-reverse-transition>
  </div>

  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" :show="selectedShow" />
</template>
