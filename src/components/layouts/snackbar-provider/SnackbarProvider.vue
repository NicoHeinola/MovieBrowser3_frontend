<script setup lang="ts">
import type { QueuedSnackbar } from './QueuedSnackbar';
import type { SnackbarApi } from './SnackbarApi';
import type { SnackbarDismissReason } from './SnackbarDismissReason';
import type { SnackbarOptions } from './SnackbarOptions';
import { provide, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { snackbarApiKey } from './snackbarApiKey';

const { t } = useI18n();

const snackbars = ref<QueuedSnackbar[]>([]);

const showSnackbar = (options: SnackbarOptions): Promise<SnackbarDismissReason> => {
  return new Promise((resolve) => {
    snackbars.value.push({
      text: options.message,
      color: options.color ?? 'success',
      timeout: options.timeout ?? 3000,
      location: options.location ?? 'bottom',
      closable: options.closable ?? true,
      variant: 'tonal',
      onDismiss: resolve,
    });
  });
};

const snackbarApi: SnackbarApi = {
  showSnackbar,
};

provide(snackbarApiKey, snackbarApi);
</script>

<template>
  <slot />

  <v-snackbar-queue v-model="snackbars" :total-visible="5" display-strategy="overflow" closable>
    <template #actions="{ props }: any">
      <v-btn color="default" v-bind="props"> {{ t('common.snackbarClose') }} </v-btn>
    </template>
  </v-snackbar-queue>
</template>
