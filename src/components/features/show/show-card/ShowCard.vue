<script lang="ts" setup>
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';

import { getPrimaryShowTitle } from '@/utils/show/getPrimaryShowTitle';

const props = withDefaults(
  defineProps<{
    show: Show;
    imageToUse?: 'card' | 'banner';
    width?: string | number;
    height?: string | number;
  }>(),
  {
    imageToUse: 'banner',
    width: '300px',
    height: '400px',
  },
);

const cardImage = computed(() => {
  if (props.imageToUse === 'card') return props.show.card_image_url;
  return props.show.banner_url;
});

const primaryTitle = computed(() => getPrimaryShowTitle(props.show));
</script>

<template>
  <v-card :height="props.height" :min-width="props.width" :width="props.width" border="sm" class="show-card">
    <v-img :src="cardImage" class="h-100 w-100" style="pointer-events: none" cover></v-img>
    <div class="card-shadow position-absolute bottom-0 left-0 w-100" style="height: 20%" />
    <div class="position-absolute bottom-0 left-0 px-4 my-4 text-truncate" style="cursor: pointer; max-width: 100%">
      <p
        class="card-title text-truncate text-grey-lighten-2 ma-0 font-weight-bold"
        style="text-shadow: 0 0 5px rgb(var(--v-theme-background), 0.7)"
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
  transition:
    transform 0.3s ease-in-out,
    border-color 0.3s ease-in-out,
    filter 0.3s ease-in-out;

  :deep(.v-img) {
    transition:
      transform 0.3s ease-in-out,
      filter 0.3s ease-in-out;

    transform: scale(1.14) translateY(0px);
  }

  &:hover {
    transform: translateY(-12px) scale(1.04);
    filter: brightness(105%);
    z-index: 100;

    border-color: rgb(var(--v-theme-surface)) !important;

    :deep(.v-img) {
      cursor: pointer;
      transform: scale(1.12) translateY(12px);
    }

    .card-title {
      color: white !important;
    }
  }

  .card-title {
    transition: color 0.3s ease-in-out;
  }

  .card-shadow {
    background: linear-gradient(
      to top,
      rgb(var(--v-theme-background), 0.96),
      rgb(var(--v-theme-background), 0.48) 48%,
      transparent 100%
    );
    opacity: 0.7;
    pointer-events: none;
  }
}
</style>
