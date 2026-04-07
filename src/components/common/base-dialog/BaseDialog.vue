<script setup lang="ts">
import type { BaseDialogProps } from './baseDialogProps';

const props = withDefaults(defineProps<BaseDialogProps>(), {
  maxWidth: 420,
  persistent: true,
});
</script>

<template>
  <v-dialog :max-width="props.maxWidth" :model-value="props.modelValue" :persistent="props.persistent">
    <v-card rounded="xl">
      <v-card-text class="pa-6">
        <slot />
      </v-card-text>
      <v-card-actions class="pa-6 pt-0">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
