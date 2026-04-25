<script setup lang="ts">
import type { BaseDialogProps } from './baseDialogProps';

import { computed, useSlots } from 'vue';

const props = withDefaults(defineProps<BaseDialogProps>(), {
  maxWidth: 420,
  persistent: true,
});

const slots = useSlots();
const hasTitleSlot = computed(() => !!slots.title);
</script>

<template>
  <v-dialog :max-width="props.maxWidth" :model-value="props.modelValue" :persistent="props.persistent">
    <v-toolbar color="surface" rounded="t-lg b-0" v-if="hasTitleSlot">
      <v-toolbar-title>
        <slot name="title" />
      </v-toolbar-title>
    </v-toolbar>
    <v-card :rounded="hasTitleSlot ? 'b-lg t-0' : 'b-lg'" elevation="0">
      <v-card-text class="pa-5 overflow-scroll">
        <slot />
      </v-card-text>
      <v-card-actions class="position-relative">
        <div class="w-100 h-100 position-absolute left-0 top-0" style="background: rgba(0, 0, 0, 0.2)"></div>
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
