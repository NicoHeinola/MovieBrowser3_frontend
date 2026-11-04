<script setup lang="ts">
import type { BaseDialogProps } from './baseDialogProps';

import { computed, useSlots } from 'vue';

import { CardActionBar } from '@/components/common/card-action-bar';

const props = withDefaults(defineProps<BaseDialogProps>(), {
  maxWidth: 420,
  persistent: true,
});

const slots = useSlots();
const hasTitleSlot = computed(() => !!slots.title);
const hasActionsSlot = computed(() => !!slots.actions);
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
      <card-action-bar v-if="hasActionsSlot">
        <slot name="actions" />
      </card-action-bar>
    </v-card>
  </v-dialog>
</template>
