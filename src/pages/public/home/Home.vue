<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';

import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import SelectedShowDrawer from '@/components/features/show/selected-show-drawer/SelectedShowDrawer.vue';
import ShowBanner from '@/components/features/show/show-banner/ShowBanner.vue';
import ShowCarousel from '@/components/features/show/show-carousel/ShowCarousel.vue';
import ShowGrid from '@/components/features/show/show-grid/ShowGrid.vue';

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
        title: 'Spider-Man: Into the Spider-Verse Spider-Man: Into the Spider-Verse Spider-Man: Into the Spider-Verse',
        is_primary: true,
      },
      {
        title: 'aweawe',
        is_primary: false,
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
  {
    id: 5,
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
  {
    id: 6,
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
  {
    id: 7,
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
  {
    id: 8,
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

const latestShows = ref<Show[]>([
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
  {
    id: 5,
    banner_url: 'https://images6.alphacoders.com/128/1280527.jpg',
    card_image_url: 'https://images6.alphacoders.com/128/1280527.jpg',
    preview_url: 'https://www.youtube.com/watch?v=QczGoCmX-pI',
    titles: [
      {
        title: 'Blue Eye Samurai',
        is_primary: true,
      },
    ],
  },
  {
    id: 6,
    banner_url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2023/01/nier-automata-anime-poster.jpg',
    card_image_url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2023/01/nier-automata-anime-poster.jpg',
    preview_url: 'https://youtu.be/eIMZYgb85xg?si=BfqVQ3UBY4w6WAEP',
    titles: [
      {
        title: 'Frieren',
        is_primary: true,
      },
    ],
  },
  {
    id: 7,
    banner_url: 'https://images6.alphacoders.com/137/thumb-1920-1378928.png',
    card_image_url: 'https://images6.alphacoders.com/137/thumb-1920-1378928.png',
    preview_url: null,
    titles: [
      {
        title: 'Dune: Part Two',
        is_primary: true,
      },
    ],
  },
  {
    id: 8,
    banner_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    preview_url: 'https://youtu.be/doesnotwork',
    titles: [
      {
        title: 'The Creator',
        is_primary: true,
      },
    ],
  },
]);

const selectedBannerShow = ref<Show | null>(null);
const selectedShow = ref<Show | null>(selectedBannerShow.value);
const isShowDrawerVisible = ref<boolean>(false);

const { xxl, xlAndUp, lgAndUp } = useDisplay();

const continueWatchingCols = computed(() => {
  if (xxl.value) return 5;
  if (xlAndUp.value) return 4;
  if (lgAndUp.value) return 3;
  return 1;
});

watch(
  () => selectedBannerShow.value,
  (newVal) => {
    if (newVal) {
      selectedShow.value = newVal;
    }
  },
);
</script>

<template>
  <show-banner
    :disable-video-playback="isShowDrawerVisible"
    :selected-show="selectedBannerShow"
    style="margin-top: -70px"
  >
    <v-row align="center" style="max-width: 90%">
      <v-col cols="12">
        <h1>Continue Watching</h1>
        <show-grid
          v-model:selected-show="selectedBannerShow"
          :cols="continueWatchingCols"
          :shows="continueToWatchShows"
          @click:show="isShowDrawerVisible = true"
        />
      </v-col>
    </v-row>
  </show-banner>
  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" :show="selectedShow" />
  <v-container class="pl-16 pr-0" fluid>
    <h1>Latest shows</h1>
    <show-carousel
      v-model:selected-show="selectedShow"
      :shows="latestShows"
      class="pr-16"
      @click:show="isShowDrawerVisible = true"
    />
  </v-container>
</template>
