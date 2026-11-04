<script setup lang="ts">
import type { ConfirmDialogProps } from './confirmDialogProps';

import { useI18n } from 'vue-i18n';

import { BaseDialog } from '@/components/common/base-dialog';

const { t } = useI18n();

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  confirmText: undefined,
  cancelText: undefined,
  confirmColor: 'primary',
});
</script>

<template>
  <base-dialog :model-value="props.modelValue">
    <p class="text-pre-wrap">
      {{ props.message }}
    </p>

    <template #actions>
      <v-row class="ga-2" justify="end">
        <v-btn color="default" @click="props.close(false)">
          {{ props.cancelText ?? t('common.cancel') }}
        </v-btn>
        <v-btn :color="props.confirmColor" variant="flat" @click="props.close(true)">
          {{ props.confirmText ?? t('common.confirm') }}
        </v-btn>
      </v-row>
    </template>
  </base-dialog>
</template>
