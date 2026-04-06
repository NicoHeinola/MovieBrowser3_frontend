<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';

import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { VolumeControl } from '@/components/common/volume-control';
import { YouTubePlayer } from '@/components/common/youtube-player';
import { getPrimaryShowTitle } from '@/utils/show/getPrimaryShowTitle';
import { getYouTubeEmbedUrl } from '@/utils/youtube/getYouTubeEmbedUrl';

export interface SelectedShowDrawerProps {
  show: Show | null;
}

const props = defineProps<SelectedShowDrawerProps>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const { xlAndUp } = useDisplay();

const isVideoPlaying = ref(false);
const isVideoError = ref(false);
const isMuted = ref(true);
const volume = ref(20);

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
});
</script>

<template>
  <v-navigation-drawer
    v-model="isShown"
    :width="xlAndUp ? 600 : 400"
    class="selected-show-drawer"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    temporary
  >
    <div class="h-50 position-relative overflow-hidden w-100">
      <v-fade-transition>
        <div class="youtube-video-container position-absolute top-0 left-0 w-100 h-100" v-if="canPlayVideo">
          <you-tube-player
            :muted="isMuted"
            :video-id="activeVideoId"
            :volume="volume"
            @error="isVideoError = true"
            @playing="isVideoPlaying = true"
          />
        </div>
      </v-fade-transition>

      <v-fade-transition>
        <v-img
          :src="props.show?.banner_url || props.show?.card_image_url"
          class="w-100 h-100"
          cover
          v-if="
            ((props.show?.banner_url || props.show?.card_image_url) && (!canPlayVideo || !isVideoPlaying)) || !videoId
          "
        />
      </v-fade-transition>

      <div class="image-shadow position-absolute w-100 h-100 top-0 left-0">
        <div class="d-flex align-end h-100 pa-6">
          <h1>{{ displayTitle }}</h1>
        </div>
      </div>

      <v-fade-transition>
        <volume-control
          v-model:muted="isMuted"
          v-model:volume="volume"
          class="position-absolute left-0 top-0 ma-4"
          v-if="isVideoPlaying"
        />
      </v-fade-transition>

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
    width: 100vh;
    height: 100vw;
    transform: translate(-50%, -50%);

    @media (max-aspect-ratio: 16/9) {
      height: 100vh;
    }
  }
}

.image-shadow {
  background: linear-gradient(to top, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface), 0.4) 100%);
}
</style>
