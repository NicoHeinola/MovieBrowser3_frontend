<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { BaseForm } from '@/components/common/base-form';

const props = defineProps<{
  id: string;
}>();

const show = defineModel<Show | null>('show', { required: true });
const isValid = defineModel<boolean>('isValid', {
  default: false,
});
</script>

<template>
  <base-form v-model:is-valid="isValid" :id="props.id">
    <v-row>
      <v-col cols="12"> </v-col>
    </v-row>
  </base-form>
</template>
