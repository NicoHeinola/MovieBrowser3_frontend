<script setup lang="ts">
import type { Download } from '@/interfaces/api/models/Download';
import type { DataTableHeader } from 'vuetify';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { DownloadProgress } from '@/components/features/download/download-progress';
import { DownloadStatusChip } from '@/components/features/download/download-status-chip';
import { getDownloadRate } from '@/utils/download/getDownloadRate';
import { hasDownloadProgress } from '@/utils/download/hasDownloadProgress';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { formatDateTime } from '@/utils/time/formatDateTime';

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
 * @param download - The download.
 * @returns Such as "2.0 MB/s", or a dash while it moves no data.
 */
const getSpeedText = (download: Download): string => getDownloadRate(download)?.speed ?? '–';

/**
 * How long a download still takes.
 * @param download - The download.
 * @returns Such as "5:00", or a dash while it moves no data or can't tell.
 */
const getTimeLeftText = (download: Download): string => getDownloadRate(download)?.timeLeft ?? '–';
</script>

<template>
  <v-skeleton-loader type="table-tbody" v-if="props.isPending" />
  <v-data-table
    :headers="headers"
    :items="props.downloads"
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
      <download-progress :download="item" v-if="hasDownloadProgress(item)" />
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
