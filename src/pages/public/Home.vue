<script lang="ts" setup>
import type { Show } from '@/interfaces/api/Show';
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import ShowCard from '@/components/features/show/show-card/ShowCard.vue';
import { getYouTubeEmbedUrl } from '@/utils/youtube/getYouTubeEmbedUrl';

const continueToWatchShows = ref<Show[]>([
  {
    id: 1,
    banner_url: 'https://www.youtube.com/watch?v=QczGoCmX-pI',
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
    banner_url: 'https://youtu.be/eIMZYgb85xg?si=BfqVQ3UBY4w6WAEP',
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
    banner_url: 'https://images6.alphacoders.com/137/thumb-1920-1378928.png',
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
    banner_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    titles: [
      {
        title: 'Oppenheimer',
        is_primary: true,
      },
    ],
  },
]);

const bannerUrls = computed(() => continueToWatchShows.value.map((show) => show.banner_url));
const selectedBannerShow = ref<Show | null>(continueToWatchShows.value[0]);
const youtubeEmbedUrl = computed(() => {
  if (!selectedBannerShow.value) return null;
  return getYouTubeEmbedUrl(selectedBannerShow.value.banner_url);
});

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
      <v-fade-transition>
        <div
          class="banner-video-container position-absolute top-0 left-0 w-100 h-100 overflow-hidden"
          style="pointer-events: none"
          v-if="youtubeEmbedUrl"
        >
          <iframe
            :src="youtubeEmbedUrl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            class="banner-video-frame"
            frameborder="0"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </v-fade-transition>

      <v-fade-transition>
        <template v-for="bannerUrl in bannerUrls" :key="bannerUrl">
          <v-img
            :src="selectedBannerShow?.banner_url"
            class="banner-image position-absolute top-0 left-0 w-100 h-100"
            height="100%"
            cover
            v-if="!youtubeEmbedUrl && selectedBannerShow?.banner_url === bannerUrl"
          >
          </v-img>
        </template>
      </v-fade-transition>
      <div class="position-absolute w-100 h-50 bottom-0 banner-gradient-background"></div>
    </div>
    <div class="position-absolute w-100 h-100 d-flex flex-column align-center justify-center top-0">
      <div :style="{ maxWidth: `min(${bannerCardContainerWidth}, 90%)` }">
        <h1>Continue Watching</h1>
        <div class="d-flex align-center ga-10 w-100 pa-1 overflow-x-scroll">
          <show-card
            v-for="show in [...continueToWatchShows]"
            :show="show"
            height="400px"
            min-width="300px"
            width="300px"
            @click="console.log('Watchi show')"
            @mouseenter="selectedBannerShow = show"
            :key="show.id"
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

// Ensure video fills container without black bars (aspect-ratio-aware cropping)
.banner-video-container {
  overflow: hidden;

  .banner-video-frame {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100vw;
    height: 100vh;
    transform: translate(-50%, -50%);
    filter: brightness(0.6);

    // This handles common 16:9 vs other aspect ratios while maintaining "cover" behavior
    @media (min-aspect-ratio: 16/9) {
      height: 56.25vw; // 100 / 16 * 9
    }

    @media (max-aspect-ratio: 16/9) {
      width: 177.78vh; // 100 / 9 * 16
    }
  }
}
</style>
