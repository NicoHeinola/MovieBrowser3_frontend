<script setup lang="ts">
import type { Download } from '@/interfaces/api/models/Download';

import { useI18n } from 'vue-i18n';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { DownloadTable } from '@/components/features/download/download-table';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useDownloadCancel } from '@/composables/download/useDownloadCancel';
import { useDownloadRetry } from '@/composables/download/useDownloadRetry';
import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { downloadService } from '@/services/download/downloadService';
import { isDownloadActive } from '@/utils/download/isDownloadActive';
import { isDownloadCompleted } from '@/utils/download/isDownloadCompleted';
import { isDownloadRetryable } from '@/utils/download/isDownloadRetryable';
import { getPollInterval } from '@/utils/query/getPollInterval';

/** How often the list is read again while a download moves, so its progress does too. */
const POLL_INTERVAL_MS = 3000;

const { cancelDownload } = useDownloadCancel();
const { retryDownload } = useDownloadRetry();
const { t } = useI18n();

const downloadsQuery = useAPIQuery<Download[]>({
  queryKey: [DownloadQueryKey.AdminDownloads],
  queryFn: async () => await downloadService.list(),
  // Progress lives in qBittorrent: read it again while something moves, and fresh on every visit
  refetchInterval: (query) =>
    getPollInterval(
      query.state,
      (downloads) => downloads.some((download) => isDownloadActive(download.status)),
      POLL_INTERVAL_MS,
    ),
  staleTime: 0,
});
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <download-table :downloads="downloadsQuery.data.value ?? []" :is-pending="downloadsQuery.isPending.value">
          <template #actions="{ download }">
            <v-btn
              icon="mdi-refresh"
              size="small"
              variant="text"
              @click="void retryDownload(download.id, t('download.retryStarted'))"
              v-tooltip:bottom="download.status === DownloadStatus.Failed ? t('download.retry') : t('download.recheck')"
              v-if="isDownloadRetryable(download)"
            />
            <v-btn
              color="error"
              icon="mdi-trash-can"
              size="small"
              variant="text"
              @click="void cancelDownload(download)"
              v-tooltip:bottom="isDownloadCompleted(download.status) ? t('download.remove') : t('download.cancel')"
            />
          </template>

          <template #no-data>
            {{ t('download.none') }}
          </template>
        </download-table>
      </v-col>
    </v-row>
  </page-container>
</template>
