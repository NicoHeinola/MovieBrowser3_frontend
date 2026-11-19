<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { VolumeControl } from '@/components/common/volume-control';
import { YouTubePlayer } from '@/components/common/youtube-player';
import { canAutoplaySound } from '@/utils/media/canAutoplaySound';
import { getYouTubeVideoId } from '@/utils/youtube/getYouTubeVideoId';

const props = withDefaults(
  defineProps<{
    imageSrc?: string | null;
    disableVideoPlayback?: boolean;
    videoSrc?: string | null;
    /** Shows a volume control while the video plays. Without it the video stays muted. */
    showVolumeControl?: boolean;
  }>(),
  {
    imageSrc: null,
    disableVideoPlayback: false,
    videoSrc: null,
    showVolumeControl: false,
  },
);

/** Whether the video's sound is off. Only the volume control changes it. */
const muted = defineModel<boolean>('muted', { default: true });

/** The video's volume from 0 to 100. */
const volume = defineModel<number>('volume', { default: 20 });

const isVideoPlaying = ref<boolean>(false);
const isVideoError = ref<boolean>(false);
/** Mute the browser forces on a video started before the user interacted with the page. The volume control lifts it. */
const isSoundBlocked = ref<boolean>(!canAutoplaySound());

const videoId = computed<string | null>(() => getYouTubeVideoId(props.videoSrc ?? undefined));

const canPlayYouTubeVideo = computed<boolean>(
  () => Boolean(videoId.value) && !isVideoError.value && !props.disableVideoPlayback,
);

const shouldShowImage = computed<boolean>(
  () => Boolean(props.imageSrc) && (!isVideoPlaying.value || !canPlayYouTubeVideo.value),
);

const activeVideoId = computed<string>(() => videoId.value ?? '');

/** What the player and volume control use. Setting it is the user's choice, which also lifts the forced mute. */
const isPlayerMuted = computed<boolean>({
  get: () => !props.showVolumeControl || isSoundBlocked.value || muted.value,
  set: (isMuted) => {
    muted.value = isMuted;
    isSoundBlocked.value = false;
  },
});

// An image change must not reset this: a running player never reports `playing` again, so the image would stay on top.
watch([() => props.videoSrc, () => props.disableVideoPlayback], () => {
  isVideoPlaying.value = false;
  isVideoError.value = false;
  // A new player starts, so check again whether it may start with sound.
  isSoundBlocked.value = !canAutoplaySound();
});
</script>

<template>
  <div class="w-100 position-relative">
    <v-fade-transition>
      <div
        class="banner-media-layer banner-video-container position-absolute top-0 left-0 w-100 h-100 overflow-hidden"
        style="pointer-events: none"
        :key="activeVideoId"
        v-if="canPlayYouTubeVideo"
      >
        <you-tube-player
          :muted="isPlayerMuted"
          :video-id="activeVideoId"
          :volume="volume"
          @error="isVideoError = true"
          @playing="isVideoPlaying = true"
        />
      </div>
    </v-fade-transition>

    <v-fade-transition>
      <v-img
        :src="props.imageSrc ?? undefined"
        class="banner-media-layer position-absolute top-0 left-0 w-100 h-100"
        height="100%"
        cover
        :key="props.imageSrc ?? 'fallback-image'"
        v-if="shouldShowImage"
      ></v-img>
    </v-fade-transition>

    <div class="position-absolute w-100 h-100 d-flex flex-column align-center justify-center top-0">
      <slot />
    </div>

    <v-fade-transition>
      <volume-control
        v-model:muted="isPlayerMuted"
        v-model:volume="volume"
        class="position-absolute right-0 bottom-0 ma-4"
        v-if="props.showVolumeControl && canPlayYouTubeVideo && isVideoPlaying"
      />
    </v-fade-transition>
  </div>
</template>

<style lang="scss" scoped>
.banner-media-layer {
  filter: brightness(0.6);
  mask-image: linear-gradient(
    to top,
    rgb(var(--v-theme-background), 0) calc(0%),
    rgb(var(--v-theme-background), 0.1) calc(12%),
    rgb(var(--v-theme-background), 1) calc(100%)
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

    @media (min-aspect-ratio: 16/9) {
      height: 56.25vw;
    }

    @media (max-aspect-ratio: 16/9) {
      width: 177.78vh;
    }
  }
}
</style>
