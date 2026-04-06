<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';

import { computed, ref, watch } from 'vue';

import { YouTubePlayer } from '@/components/common/youtube-player';
import { getYouTubeEmbedUrl } from '@/utils/youtube/getYouTubeEmbedUrl';

export interface ShowBannerProps {
  selectedShow: Show | null;
  disableVideoPlayback?: boolean;
}

const props = withDefaults(defineProps<ShowBannerProps>(), {
  disableVideoPlayback: false,
});

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

const canPlayVideo = computed(() => Boolean(videoId.value) && !isVideoError.value && !props.disableVideoPlayback);
const activeVideoId = computed(() => videoId.value ?? '');

watch([() => props.selectedShow, () => props.disableVideoPlayback], () => {
  isVideoPlaying.value = false;
  isVideoError.value = false;
});
</script>

<template>
  <div class="w-100 position-relative">
    <v-fade-transition>
      <div
        class="banner-media-layer banner-video-container position-absolute top-0 left-0 w-100 h-100 overflow-hidden"
        style="pointer-events: none"
        :key="activeVideoId"
        v-if="canPlayVideo"
      >
        <you-tube-player :video-id="activeVideoId" @error="isVideoError = true" @playing="isVideoPlaying = true" />
      </div>
    </v-fade-transition>

    <v-fade-transition>
      <v-img
        :src="props.selectedShow?.banner_url"
        class="banner-media-layer position-absolute top-0 left-0 w-100 h-100"
        height="100%"
        style="filter: brightness(0.6)"
        cover
        :key="props.selectedShow?.banner_url ?? 'fallback'"
        v-if="(props.selectedShow?.banner_url && (!canPlayVideo || !isVideoPlaying)) || !videoId"
      >
      </v-img>
    </v-fade-transition>
    <div class="position-absolute w-100 h-50 banner-gradient-background"></div>
    <div class="position-absolute w-100 h-100 d-flex flex-column align-center justify-center top-0">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner-gradient-background {
  background: linear-gradient(to top, rgb(var(--v-theme-background), 0.9) 4%, transparent 100%) !important;
  bottom: 4%;
}

.banner-media-layer {
  mask-image: linear-gradient(
    to top,
    rgb(var(--v-theme-background), 0) calc(0%),
    rgb(var(--v-theme-background), 0.1) calc(4%),
    rgb(var(--v-theme-background), 1) calc(4%)
  );
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
}

.banner-video-container {
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
