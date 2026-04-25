<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import ShowGeneralForm from './ShowGeneralForm.vue';

const show = defineModel<Show | null>('show', { required: true });
const isValid = defineModel<boolean>('isValid', {
  default: false,
});
</script>

<template>
  <show-general-form v-model:is-valid="isValid" v-model:show="show" id="show-general-form" />
</template>
