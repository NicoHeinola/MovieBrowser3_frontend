<script setup lang="ts">
import type { ShowGeneralFormData } from './ShowGeneralFormData';
import ShowGeneralFormPart from './ShowGeneralFormPart.vue';

const show = defineModel<ShowGeneralFormData | null>('show', { required: true });
const isValid = defineModel<boolean>('isValid', {
  default: false,
});
</script>

<template>
  <show-general-form-part v-model:is-valid="isValid" v-model:show="show" id="show-general-form" />
</template>
