<script setup lang="ts">
import type { ShowGeneralFormData } from './ShowGeneralFormData';
import ShowGeneralFormPart from './ShowGeneralFormPart.vue';

const show = defineModel<ShowGeneralFormData>('show', { required: true });
</script>

<template>
  <show-general-form-part v-model:show="show" />
</template>
