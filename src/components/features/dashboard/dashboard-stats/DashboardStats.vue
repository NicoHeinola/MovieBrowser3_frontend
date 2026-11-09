<script setup lang="ts">
import type { DashboardStatTile } from './dashboardStatTile';
import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { adminShowSearchFilterDefinitions } from '@/data/show/adminShowSearchFilterDefinitions';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { searchFilterQuery } from '@/utils/filter/searchFilterQuery';

const { t, locale } = useI18n();

// Written by the filter's own definition, so the link keeps working if its URL param changes.
const missingVideoFileFilter = adminShowSearchFilterDefinitions.find(({ key }) => key === 'hasMissingVideoFile')!;
const missingVideoFileQuery = searchFilterQuery.write(missingVideoFileFilter, true, false);

const props = defineProps<{
  stats: DashboardStatsResponse | undefined;
  loading?: boolean;
}>();

const tiles = computed<DashboardStatTile[]>(() => [
  {
    label: t('dashboard.shows'),
    icon: 'mdi-movie-open',
    color: 'primary',
    value: props.stats?.shows_count ?? null,
    to: { name: 'admin-shows' },
  },
  {
    label: t('dashboard.added7'),
    icon: 'mdi-calendar-week',
    color: 'success',
    value: props.stats?.shows_added_last_7_days ?? null,
  },
  {
    label: t('dashboard.added30'),
    icon: 'mdi-calendar-month',
    color: 'info',
    value: props.stats?.shows_added_last_30_days ?? null,
  },
  {
    label: t('dashboard.episodes'),
    icon: 'mdi-filmstrip',
    color: 'warning',
    value: props.stats?.episodes_count ?? null,
  },
  {
    label: t('dashboard.missingEpisodeFiles'),
    icon: 'mdi-filmstrip-off',
    color: 'error',
    value: props.stats?.episodes_missing_video_file_count ?? null,
    to: { name: 'admin-shows', query: missingVideoFileQuery },
  },
  {
    label: t('dashboard.videoFilesSize'),
    icon: 'mdi-harddisk',
    color: 'info',
    value: props.stats?.video_files_total_bytes ?? null,
    format: (bytes) => formatFileSize(bytes, locale.value),
  },
  {
    label: t('dashboard.websites'),
    icon: 'mdi-web',
    color: 'link',
    value: props.stats?.websites_count ?? null,
    to: { name: 'admin-websites' },
  },
  {
    label: t('dashboard.users'),
    icon: 'mdi-account-group',
    color: 'secondary',
    value: props.stats?.users_count ?? null,
    to: { name: 'admin-users' },
  },
]);

/**
 * Formats a tile's value for display.
 * @param tile - The tile.
 * @returns The value as text, or a dash while it is missing.
 */
const formatTileValue = (tile: DashboardStatTile): string => {
  if (tile.value === null) return '-';

  return tile.format?.(tile.value) ?? tile.value.toLocaleString(locale.value);
};
</script>

<template>
  <v-row>
    <v-col v-for="tile in tiles" class="flex-grow-1" cols="6" md="4" xl :key="tile.label">
      <v-skeleton-loader type="list-item-avatar-two-line" v-if="props.loading" />
      <!-- Only tiles with a page that lists what they count link to it; the others stay plain. -->
      <v-card :to="tile.to" class="h-100" v-else>
        <v-card-item>
          <template #prepend>
            <v-avatar :color="tile.color" rounded="lg" variant="tonal">
              <v-icon :icon="tile.icon" />
            </v-avatar>
          </template>
          <v-card-title>{{ formatTileValue(tile) }}</v-card-title>
          <v-card-subtitle>{{ tile.label }}</v-card-subtitle>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
