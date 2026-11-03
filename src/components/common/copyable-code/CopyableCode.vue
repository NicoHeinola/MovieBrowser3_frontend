<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';

const props = defineProps<{
  /** The code to show and copy, such as a shell command. */
  code: string;
}>();

const { copy } = useClipboard({ legacy: true });
const { showErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const { t } = useI18n();

/**
 * Copies the code to the clipboard.
 * @returns Nothing.
 */
const copyCode = async (): Promise<void> => {
  try {
    await copy(props.code);
    showSuccessSnackbar(t('common.copied'));
  } catch {
    showErrorSnackbar(t('common.copyFailed'));
  }
};
</script>

<template>
  <div class="d-flex align-center ga-2 pa-2 rounded bg-background">
    <code class="flex-1-1 text-body-medium text-break pl-2">{{ props.code }}</code>
    <v-btn
      :aria-label="t('common.copy')"
      icon="mdi-content-copy"
      size="small"
      variant="text"
      @click="copyCode"
      v-tooltip:bottom="t('common.copy')"
    />
  </div>
</template>
