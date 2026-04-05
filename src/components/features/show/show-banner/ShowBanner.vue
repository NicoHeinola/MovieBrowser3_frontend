<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed, ref, watch } from 'vue';
import YouTubePlayer from '@/components/common/youtube-player/YouTubePlayer.vue';
import { getYouTubeEmbedUrl } from '@/utils/youtube/getYouTubeEmbedUrl';

export interface ShowBannerProps {
  selectedShow: Show | null;
}

const props = defineProps<ShowBannerProps>();

const isVideoPlaying = ref(false);
const isVideoError = ref(false);

const youtubeEmbedUrl = computed(() => {
  if (!props.selectedShow || !props.selectedShow.preview_url) return null;
  return getYouTubeEmbedUrl(props.selectedShow.preview_url);
});

const videoId = computed(() => {
  if (!youtubeEmbedUrl.value) return null;
  const match = youtubeEmbedUrl.value.match(/embed\/([^?]+)/);
  return match ? match[1] : null;
});

watch(
  () => props.selectedShow,
  () => {
    isVideoPlaying.value = false;
    isVideoError.value = false;
  },
);
</script>

<template>
  <div class="w-100 position-relative" style="height: 70vh">
    <v-fade-transition>
      <div
        class="banner-video-container position-absolute top-0 left-0 w-100 h-100 overflow-hidden"
        style="pointer-events: none"
        v-if="videoId && !isVideoError"
        :key="videoId"
      >
        <you-tube-player :video-id="videoId" @error="isVideoError = true" @playing="isVideoPlaying = true" />
      </div>
    </v-fade-transition>

    <v-fade-transition>
      <v-img
        :src="props.selectedShow?.banner_url"
        class="banner-image position-absolute top-0 left-0 w-100 h-100"
        height="100%"
        cover
        v-if="(props.selectedShow?.banner_url && (!isVideoPlaying || isVideoError)) || !videoId"
        :key="props.selectedShow?.banner_url ?? 'fallback'"
      >
      </v-img>
    </v-fade-transition>
    <div class="position-absolute w-100 h-50 bottom-0 banner-gradient-background"></div>
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

  :deep(iframe) {
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
