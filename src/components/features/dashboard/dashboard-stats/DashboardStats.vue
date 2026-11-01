<script setup lang="ts">
import type { DashboardStatTile } from './dashboardStatTile';
import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  stats: DashboardStatsResponse | undefined;
  loading?: boolean;
}>();

const tiles = computed<DashboardStatTile[]>(() => [
  { label: t('dashboard.shows'), icon: 'mdi-movie-open', color: 'primary', value: props.stats?.shows_count ?? null },
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
  { label: t('dashboard.websites'), icon: 'mdi-web', color: 'link', value: props.stats?.websites_count ?? null },
  {
    label: t('dashboard.users'),
    icon: 'mdi-account-group',
    color: 'secondary',
    value: props.stats?.users_count ?? null,
  },
]);
</script>

<template>
  <v-row>
    <v-col v-for="tile in tiles" cols="6" md="4" xl="2" :key="tile.label">
      <v-skeleton-loader type="list-item-avatar-two-line" v-if="props.loading" />
      <v-card class="h-100" v-else>
        <v-card-item>
          <template #prepend>
            <v-avatar :color="tile.color" rounded="lg" variant="tonal">
              <v-icon :icon="tile.icon" />
            </v-avatar>
          </template>
          <v-card-title>{{ tile.value?.toLocaleString() ?? '–' }}</v-card-title>
          <v-card-subtitle>{{ tile.label }}</v-card-subtitle>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
