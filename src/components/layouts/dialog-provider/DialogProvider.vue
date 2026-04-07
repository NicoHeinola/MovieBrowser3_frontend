<script setup lang="ts">
import type { ActiveDialog } from './ActiveDialog';
import type { DialogApi } from './DialogApi';
import type { DialogCloseFunction } from './DialogCloseFunction';
import type { DialogOptions } from './DialogOptions';
import { markRaw, onUnmounted, provide, ref } from 'vue';

import { dialogApiKey } from './dialogApiKey';

const dialogs = ref<ActiveDialog[]>([]);
const defaultCloseDelay = 300;
const pendingCloseTimeouts = new Set<number>();

let nextDialogId = 0;

const removeDialog = (dialogId: number): void => {
  const dialogIndex = dialogs.value.findIndex((dialog) => dialog.id === dialogId);

  if (dialogIndex === -1) {
    return;
  }

  dialogs.value.splice(dialogIndex, 1);
};

const closeDialog = (dialogId: number, value?: unknown): void => {
  const dialog = dialogs.value.find((activeDialog) => activeDialog.id === dialogId);

  if (dialog === undefined || dialog.isClosing) {
    return;
  }

  dialog.isClosing = true;
  dialog.modelValue = false;

  dialog.resolve(value);

  const timeoutId = window.setTimeout(() => {
    pendingCloseTimeouts.delete(timeoutId);
    removeDialog(dialogId);
  }, dialog.closeDelay);

  pendingCloseTimeouts.add(timeoutId);
};

const createClose = <Result,>(dialogId: number): DialogCloseFunction<Result> => {
  return (value) => {
    closeDialog(dialogId, value);
  };
};

const showDialog = <Result = void, Props extends Record<string, unknown> = Record<string, never>>(
  options: DialogOptions<Props>,
): Promise<Result | undefined> => {
  return new Promise((resolve) => {
    dialogs.value.push({
      id: nextDialogId++,
      component: markRaw(options.component),
      modelValue: true,
      props: options.props ?? {},
      closeDelay: options.closeDelay ?? defaultCloseDelay,
      isClosing: false,
      resolve: (value) => {
        resolve(value as Result | undefined);
      },
    });
  });
};

const dialogApi: DialogApi = {
  showDialog,
};

provide(dialogApiKey, dialogApi);

onUnmounted(() => {
  for (const timeoutId of pendingCloseTimeouts) {
    window.clearTimeout(timeoutId);
  }

  pendingCloseTimeouts.clear();

  for (const dialog of dialogs.value) {
    if (!dialog.isClosing) {
      dialog.resolve(undefined);
    }
  }

  dialogs.value = [];
});
</script>

<template>
  <slot />

  <component
    v-for="dialog in dialogs"
    v-bind="dialog.props"
    :close="createClose(dialog.id)"
    :model-value="dialog.modelValue"
    :is="dialog.component"
    :key="dialog.id"
  />
</template>
