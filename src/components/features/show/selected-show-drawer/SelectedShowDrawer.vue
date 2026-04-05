<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';

import { computed, ref, watch } from 'vue';
import YouTubePlayer from '@/components/common/youtube-player/YouTubePlayer.vue';
import { getPrimaryShowTitle } from '@/utils/show/getPrimaryShowTitle';
import { getYouTubeEmbedUrl } from '@/utils/youtube/getYouTubeEmbedUrl';

export interface SelectedShowDrawerProps {
  show: Show | null;
}

const props = defineProps<SelectedShowDrawerProps>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const isVideoPlaying = ref(false);
const isVideoError = ref(false);
const isMuted = ref(true);

const close = () => {
  isShown.value = false;
};

const displayTitle = computed(() => getPrimaryShowTitle(props.show));

const youtubeEmbedUrl = computed(() => {
  if (!props.show?.preview_url) return null;
  return getYouTubeEmbedUrl(props.show.preview_url);
});

const videoId = computed(() => {
  if (!youtubeEmbedUrl.value) return null;
  const match = youtubeEmbedUrl.value.match(/embed\/([^?]+)/);
  return match ? match[1] : null;
});

const canPlayVideo = computed(() => Boolean(isShown.value && videoId.value) && !isVideoError.value);
const activeVideoId = computed(() => videoId.value ?? 'drawer-video');

watch([() => props.show, () => isShown.value], () => {
  isVideoPlaying.value = false;
  isVideoError.value = false;
  isMuted.value = false;
});
</script>

<template>
  <v-navigation-drawer
    v-model="isShown"
    class="selected-show-drawer"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    width="500"
    temporary
  >
    <div class="h-50 position-relative overflow-hidden w-100">
      <v-fade-transition>
        <div class="youtube-video-container position-absolute top-0 left-0 w-100 h-100" v-if="canPlayVideo">
          <you-tube-player
            :muted="isMuted"
            :video-id="activeVideoId"
            :volume="20"
            @error="isVideoError = true"
            @playing="isVideoPlaying = true"
          />
        </div>
      </v-fade-transition>

      <v-fade-transition>
        <v-img
          :src="props.show?.card_image_url"
          class="w-100 h-100"
          cover
          v-if="(props.show?.card_image_url && (!canPlayVideo || !isVideoPlaying)) || !videoId"
        />
      </v-fade-transition>

      <div class="image-shadow position-absolute w-100 h-100 top-0 left-0">
        <div class="d-flex align-end h-100 pa-6">
          <h2>{{ displayTitle }}</h2>
        </div>
      </div>

      <v-btn
        :icon="isMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
        class="position-absolute left-0 top-0 ma-4"
        variant="text"
        @click="isMuted = !isMuted"
        v-if="canPlayVideo"
      />
      <v-btn class="position-absolute right-0 top-0 ma-4" icon="mdi-close" variant="text" @click="close" />
    </div>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
.youtube-video-container {
  :deep(iframe) {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);

    @media (min-aspect-ratio: 16/9) {
      height: 56.25vw;
    }

    @media (max-aspect-ratio: 16/9) {
      width: 177.78vh;
    }
  }
}

.image-shadow {
  background: linear-gradient(to top, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface), 0.4) 100%);
}
</style>
