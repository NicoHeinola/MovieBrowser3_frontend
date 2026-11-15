<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useCopyText } from '@/composables/clipboard/useCopyText';

const props = defineProps<{
  /** The code to show and copy, such as a shell command. */
  code: string;
}>();

const { copyText } = useCopyText();
const { t } = useI18n();

/**
 * Copies the code to the clipboard.
 * @returns Nothing.
 */
const copyCode = async (): Promise<void> => {
  await copyText(props.code);
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
