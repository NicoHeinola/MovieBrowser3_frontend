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
import { isDownloadCompleted } from '@/utils/download/isDownloadCompleted';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { formatDateTime } from '@/utils/time/formatDateTime';
import { formatDuration } from '@/utils/time/formatDuration';

/** A download as the table shows it. */
interface DownloadRow extends Download {
  progressParts: DownloadProgress | null;
  isCompleted: boolean;
}

const props = defineProps<{
  downloads: Download[];
  /** Shows a placeholder instead of the table, for the first load. */
  isPending: boolean;
}>();

defineSlots<{
  /** A row's buttons, after the link to its show, such as retry and cancel. */
  actions?: (scope: { download: Download }) => unknown;
  /** Shown when there are no downloads. */
  'no-data'?: () => unknown;
}>();

const { locale, t } = useI18n();

/**
 * The downloads with their progress worked out once per row, not once per cell that shows it. A finished download's
 * torrent leaves qBittorrent once seeded, taking its sizes with it, so it simply reads as complete.
 */
const rows = computed<DownloadRow[]>(() =>
  props.downloads.map((download) => {
    const isCompleted = isDownloadCompleted(download.status);
    let progressParts = getDownloadProgress(download);

    if (isCompleted) {
      progressParts ??= { percent: t('download.percent', { percent: 100 }), bytes: '' };
    }

    return { ...download, isCompleted, progressParts };
  }),
);

/**
 * What's under a download's progress bar. Once its finished files are on their way to their episodes, all bytes are
 * downloaded and say nothing, so it's how many files arrived.
 * @param row - The download's row.
 * @returns Such as "3 of 25 files in place" or "1.0 GB of 4.0 GB".
 */
const getProgressText = (row: DownloadRow): string => {
  if (row.status === DownloadStatus.Importing) {
    const counts = { done: row.imported_file_count, count: row.picked_file_count };

    return t('download.filesInPlace', counts, row.picked_file_count);
  }

  return row.progressParts?.bytes || '–';
};

/** The list is short and comes newest first, so the columns are not sortable. */
const headers = computed<DataTableHeader[]>(() => [
  { title: t('download.name'), key: 'name', sortable: false },
  { title: t('download.status'), key: 'status', sortable: false, width: 150 },
  { title: t('download.progress'), key: 'progress', sortable: false, width: 220 },
  { title: t('download.speed'), key: 'download_speed', align: 'end', sortable: false, width: 120 },
  { title: t('download.timeLeft'), key: 'eta_seconds', align: 'end', sortable: false, width: 120 },
  { title: t('download.added'), key: 'created_at', align: 'end', sortable: false, width: 220 },
  { title: '', key: 'actions', align: 'end', sortable: false, width: 152 },
]);

/**
 * How fast a download goes.
 * @param row - The download's row.
 * @returns Such as "2.0 MB/s", or a dash while it moves no data.
 */
const getSpeedText = (row: DownloadRow): string => {
  if (row.status !== DownloadStatus.Downloading) {
    return '–';
  }

  return t('download.perSecond', { size: formatFileSize(row.download_speed, locale.value) });
};

/**
 * How long a download still takes.
 * @param row - The download's row.
 * @returns Such as "5 min", or a dash while it moves no data or can't tell.
 */
const getTimeLeftText = (row: DownloadRow): string => {
  if (row.status !== DownloadStatus.Downloading || row.eta_seconds === null) {
    return '–';
  }

  return formatDuration(row.eta_seconds);
};
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
      <div class="d-flex flex-column" v-if="item.size_bytes > 0 || item.isCompleted || isDownloadActive(item.status)">
        <div class="d-flex align-center ga-2">
          <v-progress-linear
            :color="DOWNLOAD_STATUS_STYLES[item.status].color"
            :indeterminate="(item.size_bytes === 0 && !item.isCompleted) || item.status === DownloadStatus.Importing"
            :model-value="item.isCompleted ? 100 : item.progress * 100"
            :striped="item.status === DownloadStatus.Downloading"
            height="8"
            rounded
          />
          <span class="text-body-small font-weight-medium text-no-wrap" v-if="item.progressParts">
            {{ item.progressParts.percent }}
          </span>
        </div>
        <span class="text-medium-emphasis text-body-small">{{ getProgressText(item) }}</span>
      </div>
      <span class="text-medium-emphasis" v-else>–</span>
    </template>

    <template #item.download_speed="{ item }">
      <span class="text-medium-emphasis">
        {{ getSpeedText(item) }}
      </span>
    </template>

    <template #item.eta_seconds="{ item }">
      <span class="text-medium-emphasis">
        {{ getTimeLeftText(item) }}
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
        <slot :download="item" name="actions" v-if="$slots.actions" />
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
