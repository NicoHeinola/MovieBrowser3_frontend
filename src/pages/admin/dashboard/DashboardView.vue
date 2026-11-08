<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { Website } from '@/interfaces/api/models/Website';
import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { DashboardStats } from '@/components/features/dashboard/dashboard-stats';
import { StorageChart } from '@/components/features/dashboard/storage-chart';
import { RecentShowList } from '@/components/features/show/recent-show-list';
import { FavoriteWebsiteList } from '@/components/features/website/favorite-website-list';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useWebsiteEditDialog } from '@/composables/website/useWebsiteEditDialog';
import { DashboardQueryKey } from '@/enums/query/dashboardQueryKey';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { dashboardStatsService } from '@/services/dashboard/dashboardStatsService';
import { showService } from '@/services/show/showService';
import { websiteService } from '@/services/website/websiteService';

const RECENT_SHOW_COUNT = 8;
/** How many of the biggest shows get their own arc in the storage chart. */
const STORAGE_SHOW_COUNT = 12;

const router = useRouter();
const { openWebsiteEditDialog } = useWebsiteEditDialog();
const { t } = useI18n();

const statsQuery = useAPIQuery<DashboardStatsResponse>({
  queryKey: [DashboardQueryKey.AdminDashboardStats],
  queryFn: async () => await dashboardStatsService.get(),
  // Every admin page changes these counts, so they refetch on each visit instead of being invalidated from each.
  staleTime: 0,
});

const favoriteWebsitesQuery = useAPIQuery<PaginatedResponse<Website>>({
  queryKey: [WebsiteQueryKey.AdminDashboardWebsites],
  queryFn: async () =>
    await websiteService.list({
      filter: { is_favorite: '1' },
      sort: 'title',
      page: { number: 0, size: 0 },
    }),
});

const storageShowsQuery = useAPIQuery<PaginatedResponse<Show>>({
  queryKey: [ShowQueryKey.AdminDashboardStorageShows],
  // Only the biggest shows: the backend ranks them, and the chart groups the rest from the stats total.
  queryFn: async () => await showService.list({ sort: '-video_files_bytes', page: { size: STORAGE_SHOW_COUNT } }),
});

const recentShowsQuery = useAPIQuery<PaginatedResponse<Show>>({
  queryKey: [ShowQueryKey.AdminDashboardShows],
  queryFn: async () => await showService.list({ sort: '-created_at', page: { size: RECENT_SHOW_COUNT } }),
});

/**
 * Opens the show editor on a show, or on a new show. The counts refetch when the dashboard is shown again.
 * @param show - The show to edit; leave it out to add a show.
 * @returns Nothing.
 */
const editShow = async (show?: Show): Promise<void> => {
  await router.push(show ? { name: 'admin-show-edit', params: { showId: show.id } } : { name: 'admin-show-new' });
};

/**
 * Adds a website and refreshes the counts once it is saved.
 * @returns Nothing.
 */
const addWebsite = async (): Promise<void> => {
  if (await openWebsiteEditDialog()) {
    await statsQuery.refetch();
  }
};
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <v-row gap="48">
      <titled-section :title="t('dashboard.overview')" icon="mdi-chart-box-outline" icon-color="primary">
        <dashboard-stats :loading="statsQuery.isLoading.value" :stats="statsQuery.data.value" />

        <template #append>
          <div class="d-flex flex-1-1 justify-end ga-2">
            <v-btn color="primary" prepend-icon="mdi-movie-plus" @click="void editShow()">{{
              t('dashboard.addShow')
            }}</v-btn>
            <v-btn color="primary" prepend-icon="mdi-web-plus" @click="void addWebsite()">{{
              t('dashboard.addWebsite')
            }}</v-btn>
          </div>
        </template>
      </titled-section>

      <titled-section :title="t('dashboard.storage')" icon="mdi-harddisk" icon-color="info">
        <storage-chart
          :loading="statsQuery.isLoading.value || storageShowsQuery.isLoading.value"
          :shows="storageShowsQuery.data.value?.data ?? []"
          :stats="statsQuery.data.value"
          @click:show="editShow"
        />
      </titled-section>

      <v-col cols="12" lg="6">
        <titled-section :title="t('dashboard.favoriteWebsites')" icon="mdi-star" icon-color="primary">
          <favorite-website-list
            :loading="favoriteWebsitesQuery.isLoading.value"
            :websites="favoriteWebsitesQuery.data.value?.data ?? []"
          />

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn :to="{ name: 'admin-websites' }" append-icon="mdi-arrow-right" variant="text">{{
                t('dashboard.allWebsites')
              }}</v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>

      <v-col cols="12" lg="6">
        <titled-section :title="t('dashboard.recentlyAdded')" icon="mdi-clock-outline" icon-color="warning">
          <recent-show-list
            :loading="recentShowsQuery.isLoading.value"
            :shows="recentShowsQuery.data.value?.data ?? []"
            @click:show="editShow"
          />

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn :to="{ name: 'admin-shows' }" append-icon="mdi-arrow-right" variant="text">{{
                t('dashboard.allShows')
              }}</v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
