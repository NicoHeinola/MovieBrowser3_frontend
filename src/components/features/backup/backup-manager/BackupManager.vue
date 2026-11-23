<script setup lang="ts">
import type { Backup } from '@/interfaces/api/models/Backup';
import type { ListResponse } from '@/interfaces/api/responses/ListResponse';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { TitledSection } from '@/components/common/titled-section';
import { BackupTable } from '@/components/features/backup/backup-table';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { BackupQueryKey } from '@/enums/query/backupQueryKey';
import { backupService } from '@/services/backup/backupService';

const isBackingUp = ref<boolean>(false);

const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const backupQuery = useAPIQuery<ListResponse<Backup>>({
  queryKey: [BackupQueryKey.AdminBackups],
  queryFn: async () => await backupService.list(),
  // Scheduled backups run while this page is closed, so read them on each visit.
  staleTime: 0,
});

/**
 * Backs up the database now and reloads the list. A failure says why, such as a backup folder on a drive that isn't
 * connected: the one place the admin learns why scheduled backups fail.
 * @returns Nothing.
 */
const backUpNow = async (): Promise<void> => {
  isBackingUp.value = true;

  try {
    await backupService.create();
    showSuccessSnackbar(t('backup.finished'));
    await backupQuery.refetch();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isBackingUp.value = false;
  }
};
</script>

<template>
  <titled-section
    :subtitle="t('backup.sectionSubtitle')"
    :title="t('backup.section')"
    icon="mdi-database-outline"
    icon-color="success"
  >
    <backup-table :backups="backupQuery.data.value?.data ?? []" :is-pending="backupQuery.isPending.value" />

    <template #append>
      <div class="d-flex flex-1-1 justify-end">
        <v-btn
          :loading="isBackingUp"
          prepend-icon="mdi-database-export-outline"
          variant="tonal"
          @click="void backUpNow()"
        >
          {{ t('backup.backUpNow') }}
        </v-btn>
      </div>
    </template>
  </titled-section>
</template>
