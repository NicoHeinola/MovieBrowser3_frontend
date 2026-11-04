<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { HighlightText } from '@/components/common/highlight-text';

const props = defineProps<{
  /** i18n key of the sentence, which marks the highlighted words with `{highlight}`. */
  keypath: string;
  /** i18n key of the highlighted words. */
  highlightKey: string;
}>();

const { t } = useI18n();
</script>

<template>
  <i18n-t :keypath="props.keypath" tag="span">
    <template #highlight>
      <highlight-text>{{ t(props.highlightKey) }}</highlight-text>
    </template>
  </i18n-t>
</template>
