<script setup lang="ts">
import type { ShowEntriesFormData } from './ShowEntriesFormData';
import ShowEntriesFormPart from './ShowEntriesFormPart.vue';

const show = defineModel<ShowEntriesFormData>('show', { required: true });
</script>

<template>
  <show-entries-form-part v-model:show="show" />
</template>
