<script lang="ts" setup>
import type { Show } from '@/interfaces/api/Show';
import { computed, ref } from 'vue';
import ShowCard from '@/components/features/show/show-card/ShowCard.vue';
import { useDisplay } from 'vuetify';

const continueToWatchShows = ref<Show[]>([
  {
    id: 1,
    hero_image_url: 'https://images6.alphacoders.com/128/1280527.jpg',
    card_image_url: 'https://images6.alphacoders.com/128/1280527.jpg',
    titles: [
      {
        title: 'Cyberpunk Edgerunners',
        is_primary: true,
      },
    ],
  },
  {
    id: 2,
    hero_image_url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2023/01/nier-automata-anime-poster.jpg',
    card_image_url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2023/01/nier-automata-anime-poster.jpg',
    titles: [
      {
        title: 'Arcane',
        is_primary: true,
      },
    ],
  },
  {
    id: 3,
    hero_image_url: 'https://images6.alphacoders.com/137/thumb-1920-1378928.png',
    card_image_url: 'https://images6.alphacoders.com/137/thumb-1920-1378928.png',
    titles: [
      {
        title: 'Spider-Man: Into the Spider-Verse',
        is_primary: true,
      },
    ],
  },
  {
    id: 4,
    hero_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    titles: [
      {
        title: 'Oppenheimer',
        is_primary: true,
      },
    ],
  },
]);

const selectedBannerShow = ref<Show | null>(null);

const { xxl, xlAndUp, lgAndUp } = useDisplay();

const bannerCardContainerWidth = computed(() => {
  const basePadding = 40;
  const baseCardSize = 300;

  if (xxl.value) return (basePadding + baseCardSize) * 5 - 30 + 'px';
  if (xlAndUp.value) return (basePadding + baseCardSize) * 4 - 30 + 'px';
  if (lgAndUp.value) return (basePadding + baseCardSize) * 3 - 30 + 'px';
  return '310px';
});
</script>

<template>
  <div class="position-absolute w-100" style="left: 50%; transform: translateX(-50%); top: 0">
    <div style="height: 70vh">
      <v-img class="banner-image" height="100%" :src="selectedBannerShow?.hero_image_url" cover> </v-img>
      <div class="position-absolute w-100 h-50 bottom-0 banner-gradient-background"></div>
    </div>
    <div class="position-absolute w-100 h-100 d-flex flex-column align-center justify-center top-0">
      <div :style="{ maxWidth: `min(${bannerCardContainerWidth}, 90%)` }">
        <h1>Continue Watching</h1>
        <div class="d-flex align-center ga-10 w-100 pa-1 overflow-scroll">
          <show-card
            v-for="show in [...continueToWatchShows]"
            :image-url="show.card_image_url"
            :show="show"
            height="400px"
            min-width="300px"
            width="300px"
            :is-selected="selectedBannerShow?.id === show.id"
            :key="show.id"
            @mouseenter="selectedBannerShow = show"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/styles/settings' as settings;

.banner-gradient-background {
  background: linear-gradient(to top, #121212 1%, transparent) !important;
}

.banner-image {
  filter: brightness(0.6);
}
</style>
