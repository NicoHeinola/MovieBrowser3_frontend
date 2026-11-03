<script setup lang="ts">
import type { UpdateDialogProps } from '@/components/features/version/update-dialog';
import { useI18n } from 'vue-i18n';

import { UpdateDialog } from '@/components/features/version/update-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useUpdateNotice } from '@/composables/version/useUpdateNotice';

const dialog = useDialog();
const { update } = useUpdateNotice();
const { t } = useI18n();

/**
 * Opens the update dialog with the update command and release links.
 * @returns Nothing.
 */
const openDialog = async (): Promise<void> => {
  if (update.value === null) {
    return;
  }

  await dialog.showDialog<void, Omit<UpdateDialogProps, 'close' | 'modelValue'>>({
    component: UpdateDialog,
    props: { update: update.value },
  });
};
</script>

<template>
  <v-btn
    class="text-none"
    color="primary"
    prepend-icon="mdi-update"
    size="small"
    variant="tonal"
    @click="openDialog"
    v-if="update"
  >
    {{ t('update.available') }}
  </v-btn>
</template>
