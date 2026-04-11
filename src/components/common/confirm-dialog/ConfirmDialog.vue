<script setup lang="ts">
import type { ConfirmDialogProps } from './confirmDialogProps';

import { BaseDialog } from '@/components/common/base-dialog';

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'primary',
});
</script>

<template>
  <base-dialog :model-value="props.modelValue">
    {{ props.message }}

    <template #actions>
      <v-row class="ga-2" justify="end">
        <v-btn color="default" @click="props.close(false)">
          {{ props.cancelText }}
        </v-btn>
        <v-btn :color="props.confirmColor" variant="tonal" @click="props.close(true)">
          {{ props.confirmText }}
        </v-btn>
      </v-row>
    </template>
  </base-dialog>
</template>
