<script setup lang="ts">
import type { Download } from '@/interfaces/api/models/Download';

import { useI18n } from 'vue-i18n';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { DownloadTable } from '@/components/features/download/download-table';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useDownloadCancel } from '@/composables/download/useDownloadCancel';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DownloadErrorCode } from '@/enums/download/DownloadErrorCode';
import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { downloadService } from '@/services/download/downloadService';
import { isDownloadActive } from '@/utils/download/isDownloadActive';
import { getPollInterval } from '@/utils/query/getPollInterval';

/** How often the list is read again while a download moves, so its progress does too. */
const POLL_INTERVAL_MS = 3000;

const { cancel } = useDownloadCancel();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
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

/**
 * Asks before cancelling a download, then reads the list again.
 * @param download - The download.
 * @returns Nothing.
 */
const cancelDownload = async (download: Download): Promise<void> => {
  if (await cancel(download)) {
    await downloadsQuery.refetch();
  }
};

/**
 * Whether a download is done, so its trash button only removes it from the list rather than cancelling it.
 * @param download - The download.
 * @returns True once completed.
 */
const isFinished = (download: Download): boolean => download.status === DownloadStatus.Completed;

/**
 * Whether a failed download can be tried again: a failed copy can, a torrent qBittorrent lost can't.
 * @param download - The download.
 * @returns True for a failed import.
 */
const canRetry = (download: Download): boolean =>
  download.status === DownloadStatus.Failed && download.error_code !== DownloadErrorCode.ClientLostTorrent;

/**
 * Tries a failed download's imports again, then reads the list, which polls again while it runs.
 * @param download - The download.
 * @returns Nothing.
 */
const retryDownload = async (download: Download): Promise<void> => {
  try {
    await downloadService.retry(download.id);
    showSuccessSnackbar(t('download.retryStarted'));
    await downloadsQuery.refetch();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};
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
              @click="void retryDownload(download)"
              v-tooltip:bottom="t('download.retry')"
              v-if="canRetry(download)"
            />
            <v-btn
              color="error"
              icon="mdi-trash-can"
              size="small"
              variant="text"
              @click="void cancelDownload(download)"
              v-tooltip:bottom="isFinished(download) ? t('download.remove') : t('download.cancel')"
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
