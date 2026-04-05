<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';
import { getYouTubeEmbedUrl } from '@/utils/youtube/getYouTubeEmbedUrl';

export interface ShowBannerProps {
  selectedShow: Show | null;
}

const props = defineProps<ShowBannerProps>();

const youtubeEmbedUrl = computed(() => {
  if (!props.selectedShow || !props.selectedShow.preview_url) return null;
  return getYouTubeEmbedUrl(props.selectedShow.preview_url);
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
          :key="youtubeEmbedUrl"
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
        <v-img
          :src="props.selectedShow.banner_url"
          class="banner-image position-absolute top-0 left-0 w-100 h-100"
          height="100%"
          cover
          v-if="!youtubeEmbedUrl && props.selectedShow?.banner_url"
          :key="props.selectedShow.banner_url"
        >
        </v-img>
      </v-fade-transition>
      <div class="position-absolute w-100 h-50 bottom-0 banner-gradient-background"></div>
    </div>
    <div class="position-absolute w-100 h-100 d-flex flex-column align-center justify-center top-0">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner-gradient-background {
  background: linear-gradient(to top, #121212 1%, transparent) !important;
}

.banner-image {
  filter: brightness(0.6);
}

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

    @media (min-aspect-ratio: 16/9) {
      height: 56.25vw;
    }

    @media (max-aspect-ratio: 16/9) {
      width: 177.78vh;
    }
  }
}
</style>
