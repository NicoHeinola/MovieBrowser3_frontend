<script lang="ts" setup>
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';

import { getPrimaryShowTitle } from '@/utils/show/getPrimaryShowTitle';

const props = withDefaults(
  defineProps<{
    show: Show;
    width?: string | number;
    height?: string | number;
  }>(),
  {
    width: '300px',
    height: '400px',
  },
);

const primaryTitle = computed(() => getPrimaryShowTitle(props.show));
</script>

<template>
  <v-card :height="props.height" :min-width="props.width" :width="props.width" class="show-card">
    <v-img :src="props.show.card_image_url" class="h-100 w-100" cover></v-img>
    <div class="card-shadow position-absolute bottom-0 left-0 w-100" style="height: 20%" />
    <div
      class="card-text-container position-absolute bottom-0 left-0 px-4 my-4 text-truncate"
      style="cursor: pointer; max-width: 100%"
    >
      <p
        class="card-title text-truncate text-grey-lighten-2 ma-0 font-weight-bold"
        style="text-shadow: 0 0 5px rgba(0, 0, 0, 0.7)"
      >
        {{ primaryTitle }}
      </p>
      <v-tooltip activator="parent" location="bottom">
        {{ primaryTitle }}
      </v-tooltip>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.show-card {
  :deep(.v-img) {
    transition:
      transform 0.3s ease-in-out,
      filter 0.3s ease-in-out;
  }

  &:hover {
    :deep(.v-img) {
      cursor: pointer;
      transform: scale(1.05);
    }

    .card-title {
      color: white !important;
    }
  }

  .card-title {
    transition: color 0.3s ease-in-out;
  }

  .card-shadow {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.829), transparent);
    opacity: 0.7;
    pointer-events: none;
  }
}
</style>
