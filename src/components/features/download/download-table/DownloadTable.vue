<script setup lang="ts">
import type { Download } from '@/interfaces/api/models/Download';
import type { DownloadProgress } from '@/utils/download/getDownloadProgress';
import type { DataTableHeader } from 'vuetify';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { DownloadStatusChip } from '@/components/features/download/download-status-chip';
import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { DOWNLOAD_STATUS_STYLES } from '@/utils/download/downloadStatusStyles';
import { getDownloadProgress } from '@/utils/download/getDownloadProgress';
import { isDownloadActive } from '@/utils/download/isDownloadActive';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { formatDateTime } from '@/utils/time/formatDateTime';
import { formatDuration } from '@/utils/time/formatDuration';

const props = defineProps<{
  downloads: Download[];
  /** Shows a placeholder instead of the table, for the first load. */
  isPending: boolean;
}>();

const emit = defineEmits<{
  /** A download's cancel button was clicked. */
  cancel: [download: Download];
}>();

const { locale, t } = useI18n();

/** The downloads with their progress worked out once per row, not once per cell that shows it. */
const rows = computed<(Download & { progressParts: DownloadProgress | null })[]>(() =>
  props.downloads.map((download) => ({ ...download, progressParts: getDownloadProgress(download) })),
);

/** The list is short and comes newest first, so the columns are not sortable. */
const headers = computed<DataTableHeader[]>(() => [
  { title: t('download.name'), key: 'name', sortable: false },
  { title: t('download.status'), key: 'status', sortable: false, width: 150 },
  { title: t('download.progress'), key: 'progress', sortable: false, width: 220 },
  { title: t('download.speed'), key: 'download_speed', align: 'end', sortable: false, width: 120 },
  { title: t('download.timeLeft'), key: 'eta_seconds', align: 'end', sortable: false, width: 120 },
  { title: t('download.added'), key: 'created_at', align: 'end', sortable: false, width: 220 },
  { title: '', key: 'actions', align: 'end', sortable: false, width: 104 },
]);

/**
 * Whether a download is moving data, so its speed and time left mean something.
 * @param download - The download.
 * @returns True while it downloads.
 */
const isDownloading = (download: Download): boolean => download.status === DownloadStatus.Downloading;
</script>

<template>
  <v-skeleton-loader type="table-tbody" v-if="props.isPending" />
  <v-data-table
    :headers="headers"
    :items="rows"
    :items-per-page="-1"
    class="download-table"
    hide-default-footer
    hover
    v-else
  >
    <template #item.name="{ item }">
      <div class="d-flex flex-column py-2" style="min-width: 0">
        <span class="font-weight-medium text-truncate" v-tooltip:bottom="item.name">{{ item.name }}</span>
        <span class="text-medium-emphasis text-body-small text-truncate" v-if="item.show">
          {{ getPrimaryTitle(item.show) }}
        </span>
      </div>
    </template>

    <template #item.status="{ item }">
      <span v-tooltip:bottom="item.error_code ? t(`download.errorCodes.${item.error_code}`) : undefined">
        <download-status-chip :status="item.status" />
      </span>
    </template>

    <template #item.progress="{ item }">
      <!-- The bar takes its status's color, stripes while data moves, and runs without an end while its size is
           unknown, so a glance tells moving, done and stuck apart -->
      <div class="d-flex flex-column" v-if="item.size_bytes > 0 || isDownloadActive(item.status)">
        <div class="d-flex align-center ga-2">
          <v-progress-linear
            :color="DOWNLOAD_STATUS_STYLES[item.status].color"
            :indeterminate="item.size_bytes === 0 || item.status === DownloadStatus.Importing"
            :model-value="item.progress * 100"
            :striped="item.status === DownloadStatus.Downloading"
            height="8"
            rounded
          />
          <span class="text-body-small font-weight-medium text-no-wrap" v-if="item.progressParts">
            {{ item.progressParts.percent }}
          </span>
        </div>
        <span class="text-medium-emphasis text-body-small">{{ item.progressParts?.bytes ?? '–' }}</span>
      </div>
      <span class="text-medium-emphasis" v-else>–</span>
    </template>

    <template #item.download_speed="{ item }">
      <span class="text-medium-emphasis">
        {{ isDownloading(item) ? t('download.perSecond', { size: formatFileSize(item.download_speed, locale) }) : '–' }}
      </span>
    </template>

    <template #item.eta_seconds="{ item }">
      <span class="text-medium-emphasis">
        {{ isDownloading(item) && item.eta_seconds !== null ? formatDuration(item.eta_seconds) : '–' }}
      </span>
    </template>

    <template #item.created_at="{ item }">
      <span class="text-medium-emphasis">{{ formatDateTime(item.created_at, locale) }}</span>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex justify-end ga-2">
        <!-- Its show's editor, with the torrent attached so more of its files can be picked -->
        <v-btn
          :to="{ name: 'admin-show-edit', params: { showId: item.show.id }, query: { download: String(item.id) } }"
          icon="mdi-pencil-outline"
          size="small"
          variant="text"
          v-tooltip:bottom="t('download.openShow')"
          v-if="item.show"
        />
        <v-btn
          color="error"
          icon="mdi-trash-can"
          size="small"
          variant="text"
          @click="emit('cancel', item)"
          v-tooltip:bottom="t('download.cancel')"
        />
      </div>
    </template>

    <template #no-data>
      <slot name="no-data" />
    </template>
  </v-data-table>
</template>

<style scoped lang="scss">
.download-table {
  :deep(table) {
    table-layout: fixed;
    width: 100%;
  }
}
</style>
