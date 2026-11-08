<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';

/** The storage chart's tooltip: a show gets its card image beside its title, other slices just their name. */
const props = defineProps<{
  label: string;
  /** The formatted size, such as `1.5 GB`. */
  size: string;
  /** The share of the chart's total, such as `12 %`; empty when there is none. */
  percent: string;
  show?: Show;
}>();
</script>

<template>
  <div class="d-flex align-center ga-4">
    <v-img :src="props.show.card_image_url" height="68" rounded="sm" width="48" cover v-if="props.show" />

    <div class="d-flex flex-column" style="max-width: 220px; white-space: normal">
      <span class="font-weight-bold">
        {{ props.label }}
      </span>
      <span class="d-flex ga-2 text-medium-emphasis">
        <span>{{ props.size }}</span>
        <span v-if="props.percent">{{ props.percent }}</span>
      </span>
    </div>
  </div>
</template>
