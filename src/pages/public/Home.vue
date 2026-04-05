<script lang="ts" setup>
import type { Show } from '@/interfaces/api/Show';
import { ref } from 'vue';
import ShowBanner from '@/components/features/show/show-banner/ShowBanner.vue';
import ShowCarousel from '@/components/features/show/show-carousel/ShowCarousel.vue';

const continueToWatchShows = ref<Show[]>([
  {
    id: 1,
    banner_url: 'https://images6.alphacoders.com/128/1280527.jpg',
    card_image_url: 'https://images6.alphacoders.com/128/1280527.jpg',
    preview_url: 'https://www.youtube.com/watch?v=QczGoCmX-pI',
    titles: [
      {
        title: 'Cyberpunk Edgerunners',
        is_primary: true,
      },
    ],
  },
  {
    id: 2,
    banner_url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2023/01/nier-automata-anime-poster.jpg',
    card_image_url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2023/01/nier-automata-anime-poster.jpg',
    preview_url: 'https://youtu.be/eIMZYgb85xg?si=BfqVQ3UBY4w6WAEP',
    titles: [
      {
        title: 'Arcane',
        is_primary: true,
      },
    ],
  },
  {
    id: 3,
    banner_url: 'https://images6.alphacoders.com/137/thumb-1920-1378928.png',
    card_image_url: 'https://images6.alphacoders.com/137/thumb-1920-1378928.png',
    preview_url: null,
    titles: [
      {
        title: 'Spider-Man: Into the Spider-Verse',
        is_primary: true,
      },
    ],
  },
  {
    id: 4,
    banner_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    preview_url: 'https://youtu.be/doesnotwork',
    titles: [
      {
        title: 'Oppenheimer',
        is_primary: true,
      },
    ],
  },
]);

const selectedBannerShow = ref<Show | null>(null);
</script>

<template>
  <show-banner :selected-show="selectedBannerShow">
    <div class="d-flex flex-column ga-4">
      <h1 class="text-h4 font-weight-bold">Continue Watching</h1>
      <show-carousel v-model:selected-show="selectedBannerShow" :shows="continueToWatchShows" />
    </div>
  </show-banner>
</template>

<style lang="scss" scoped></style>
