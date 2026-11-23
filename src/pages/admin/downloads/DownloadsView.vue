<script setup lang="ts">
import type { Download } from '@/interfaces/api/models/Download';

import { useI18n } from 'vue-i18n';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { CancelDownloadDialog } from '@/components/features/download/cancel-download-dialog';
import { DownloadTable } from '@/components/features/download/download-table';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { downloadService } from '@/services/download/downloadService';
import { isDownloadActive } from '@/utils/download/isDownloadActive';

/** How often the list is read again while a download moves, so its progress does too. */
const POLL_INTERVAL_MS = 3000;

const dialog = useDialog();
const { showSuccessSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const downloadsQuery = useAPIQuery<Download[]>({
  queryKey: [DownloadQueryKey.AdminDownloads],
  queryFn: async () => await downloadService.list(),
  // Progress lives in qBittorrent: read it again while something moves, and fresh on every visit
  refetchInterval: (query) =>
    query.state.data?.some((download) => isDownloadActive(download.status)) ? POLL_INTERVAL_MS : false,
  staleTime: 0,
});

/**
 * Asks before cancelling a download, then reads the list again.
 * @param download - The download.
 * @returns Nothing.
 */
const cancelDownload = async (download: Download): Promise<void> => {
  const isCancelled = await dialog.showDialog<boolean, { download: Download }>({
    component: CancelDownloadDialog,
    props: { download },
  });

  if (isCancelled) {
    showSuccessSnackbar(t('download.cancelled'));
    await downloadsQuery.refetch();
  }
};
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <download-table
          :downloads="downloadsQuery.data.value ?? []"
          :is-pending="downloadsQuery.isPending.value"
          @cancel="cancelDownload"
        >
          <template #no-data>
            {{ t('download.none') }}
          </template>
        </download-table>
      </v-col>
    </v-row>
  </page-container>
</template>
