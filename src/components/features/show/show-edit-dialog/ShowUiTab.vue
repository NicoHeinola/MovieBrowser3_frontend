<script setup lang="ts">
import type { ShowUiFormData } from './ShowUiFormData';
import ShowUiFormPart from './ShowUiFormPart.vue';

const show = defineModel<ShowUiFormData | null>('show', { required: true });
</script>

<template>
  <show-ui-form-part v-model:show="show" />
</template>
