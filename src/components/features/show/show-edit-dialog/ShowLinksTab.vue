<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';

import ShowLinksFormPart from './ShowLinksFormPart.vue';

const show = defineModel<Show>('show', { required: true });
</script>

<template>
  <show-links-form-part v-model:outgoing-links="show.outgoing_links" :show-id="show.id" />
</template>
