<script setup lang="ts">
import type { StorageRings } from './StorageRings';
import type { StorageShowRow } from './StorageShowRow';
import type { Show } from '@/interfaces/api/models/Show';
import type { DashboardStatsResponse } from '@/interfaces/api/responses/DashboardStatsResponse';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';

import { getStorageRings } from './getStorageRings';
import { getStorageSliceColor } from './getStorageSliceColor';
import { getStorageSliceLabel } from './getStorageSliceLabel';
import StorageDonut from './StorageDonut.vue';
import StorageShowList from './StorageShowList.vue';

/** How many of the biggest shows the list beside the chart names. */
const MAX_LISTED_SHOWS = 6;

const props = defineProps<{
  stats: DashboardStatsResponse | undefined;
  /** The biggest shows, each drawn as its own arc; the rest of the videos share one "Other shows" arc. */
  shows: Show[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  'click:show': [show: Show];
}>();

/** The show hovered in the chart or the list, so the other one highlights it too. */
const highlightedShowId = ref<number | null>(null);

const { t, locale } = useI18n();
const theme = useTheme();

const colors = computed<Record<string, string>>(() => theme.current.value.colors as Record<string, string>);

const rings = computed<StorageRings | null>(() => (props.stats ? getStorageRings(props.stats, props.shows) : null));

const videoBytes = computed<number>(() => props.stats?.video_files_total_bytes ?? 0);

/** The base of every percentage: the disk when it is known, otherwise the videos. */
const totalBytes = computed<number>(() => props.stats?.disk_total_bytes ?? videoBytes.value);

/** The disk legend under the chart, with colors matching the outer ring. */
const legend = computed(() =>
  (rings.value?.disk ?? []).map((slice) => ({
    kind: slice.kind,
    label: getStorageSliceLabel(slice, t),
    color: getStorageSliceColor(slice, 0, colors.value),
    size: formatFileSize(slice.bytes, locale.value),
  })),
);

/** The biggest shows, colored like their arcs, with their share of all video files. */
const showRows = computed<StorageShowRow[]>(() =>
  (rings.value?.shows ?? [])
    // Keep each arc's index while dropping the grouped arcs, so the row takes its arc's color.
    .flatMap((slice, index) => (slice.show ? [{ slice, show: slice.show, index }] : []))
    .slice(0, MAX_LISTED_SHOWS)
    .map(({ slice, show, index }) => ({
      show,
      title: getPrimaryTitle(show),
      color: getStorageSliceColor(slice, index, colors.value),
      size: formatFileSize(slice.bytes, locale.value),
      share: videoBytes.value > 0 ? (slice.bytes / videoBytes.value) * 100 : 0,
    })),
);
</script>

<template>
  <v-skeleton-loader type="image@2" v-if="props.loading" />

  <v-card class="h-100" v-else>
    <v-card-text>
      <v-row align="center">
        <v-col class="d-flex flex-column align-center ga-4" cols="12" md="4">
          <storage-donut
            v-model:highlighted-show-id="highlightedShowId"
            :rings="rings"
            :total-bytes="totalBytes"
            :video-bytes="videoBytes"
            @click:show="emit('click:show', $event)"
            v-if="rings"
          />

          <div class="d-flex flex-wrap justify-center ga-4" v-if="legend.length > 0">
            <div v-for="row in legend" class="d-flex align-center ga-2" :key="row.kind">
              <v-avatar :color="row.color" size="10" />
              <span class="text-body-small">
                {{ row.label }}
              </span>
              <span class="text-body-small text-medium-emphasis">
                {{ row.size }}
              </span>
            </div>
          </div>

          <p class="text-body-small text-medium-emphasis text-center" v-else>
            {{ t('dashboard.storageDiskUnknown') }}
          </p>
        </v-col>

        <v-col class="d-flex flex-column ga-2" cols="12" md="8">
          <span class="text-label-large text-medium-emphasis">
            {{ t('dashboard.storageBiggestShows') }}
          </span>

          <storage-show-list
            v-model:highlighted-show-id="highlightedShowId"
            :rows="showRows"
            @click:show="emit('click:show', $event)"
            v-if="showRows.length > 0"
          />

          <p class="text-body-small text-medium-emphasis" v-else>
            {{ t('dashboard.storageNoSizes') }}
          </p>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
