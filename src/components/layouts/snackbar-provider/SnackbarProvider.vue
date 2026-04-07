<script setup lang="ts">
import type { QueuedSnackbar } from './QueuedSnackbar';
import type { SnackbarApi } from './SnackbarApi';
import type { SnackbarColor } from './SnackbarColor';
import type { SnackbarDismissReason } from './SnackbarDismissReason';
import type { SnackbarOptions } from './SnackbarOptions';
import type { SnackbarPresetOptions } from './SnackbarPresetOptions';
import { provide, ref } from 'vue';

import { snackbarApiKey } from './snackbarApiKey';

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

const showPresetSnackbar = (
  presetColor: SnackbarColor,
  presetTimeout: number,
  messageText: string,
  overrides?: SnackbarPresetOptions,
): Promise<SnackbarDismissReason> => {
  return showSnackbar({
    message: messageText,
    color: presetColor,
    timeout: overrides?.timeout ?? presetTimeout,
    location: overrides?.location,
    closable: overrides?.closable,
  });
};

const snackbarApi: SnackbarApi = {
  showSnackbar,
  showSuccessSnackbar: (messageText, overrides) => {
    return showPresetSnackbar('success', 3000, messageText, overrides);
  },
  showErrorSnackbar: (messageText, overrides) => {
    return showPresetSnackbar('error', 5000, messageText, overrides);
  },
  showWarningSnackbar: (messageText, overrides) => {
    return showPresetSnackbar('warning', 4000, messageText, overrides);
  },
};

provide(snackbarApiKey, snackbarApi);
</script>

<template>
  <slot />

  <v-snackbar-queue v-model="snackbars" :total-visible="3" closable />
</template>
