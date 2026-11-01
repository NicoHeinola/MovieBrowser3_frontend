<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';

import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';

/** Listeners such as `@click` fall through to the root `v-list-item`. */
const props = defineProps<{
  show: Show;
  subtitle?: string;
}>();
</script>

<template>
  <v-list-item :subtitle="props.subtitle" :title="getPrimaryTitle(props.show)">
    <template #prepend>
      <v-img :src="props.show.card_image_url" class="me-4" height="52" rounded="sm" width="36" cover />
    </template>
  </v-list-item>
</template>
