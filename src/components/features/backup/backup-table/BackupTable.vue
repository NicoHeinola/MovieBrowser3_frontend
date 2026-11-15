<script setup lang="ts">
import type { Backup } from '@/interfaces/api/models/Backup';
import type { DataTableHeader } from 'vuetify';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCopyText } from '@/composables/clipboard/useCopyText';
import { CLI_PATH } from '@/data/cli/cliPath';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { formatDateTime } from '@/utils/time/formatDateTime';

const props = defineProps<{
  /** The dumps on disk, newest first. */
  backups: Backup[];
  /** Shows a placeholder instead of the table, for the first load. */
  isPending: boolean;
}>();

const { copyText } = useCopyText();
const { locale, t } = useI18n();

/** The backend lists the dumps newest first, so the columns are not sortable. */
const headers = computed<DataTableHeader[]>(() => [
  { title: t('backup.createdAt'), key: 'created_at', sortable: false },
  { title: t('backup.name'), key: 'name', sortable: false },
  { title: t('backup.size'), key: 'size', align: 'end', sortable: false, width: 120 },
  { title: '', key: 'actions', align: 'end', sortable: false, width: 72 },
]);

/**
 * Copies the command that restores a dump. The UI never restores: it replaces the whole database, so it runs on the
 * host, where the command asks to confirm first.
 * @param backup - The dump to restore.
 * @returns Nothing.
 */
const copyRestoreCommand = async (backup: Backup): Promise<void> => {
  await copyText(`${CLI_PATH} restore ${backup.name}`, { success: t('backup.restoreCommandCopied') });
};
</script>

<template>
  <v-skeleton-loader type="table-tbody" v-if="props.isPending" />
  <v-data-table :headers="headers" :items="props.backups" :items-per-page="-1" hide-default-footer hover v-else>
    <template #item.created_at="{ value }">
      <span class="text-no-wrap">{{ formatDateTime(value, locale) }}</span>
    </template>

    <template #item.name="{ value }">
      <code class="text-break">{{ value }}</code>
    </template>

    <template #item.size="{ value }">
      <span class="text-no-wrap">{{ formatFileSize(value, locale) }}</span>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        :aria-label="t('backup.copyRestoreCommand')"
        icon="mdi-backup-restore"
        size="small"
        variant="text"
        @click="void copyRestoreCommand(item)"
        v-tooltip:bottom="t('backup.copyRestoreCommand')"
      />
    </template>

    <template #no-data>{{ t('backup.noBackups') }}</template>
  </v-data-table>
</template>
