<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { computed, ref, watch } from 'vue';
import { ExpandableText } from '@/components/common/expandable-text';
import { SectionContainer } from '@/components/common/section-container';
import { VolumeControl } from '@/components/common/volume-control';
import { YouTubePlayer } from '@/components/common/youtube-player';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getYouTubeVideoId } from '@/utils/youtube/getYouTubeVideoId';

const props = defineProps<{
  isShown: boolean;
  show: Show | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const isDescriptionExpanded = ref<boolean>(false);
const isVideoPlaying = ref<boolean>(false);
const isVideoError = ref<boolean>(false);
const isMuted = ref<boolean>(true);
const volume = ref<number>(20);

let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

const videoId = computed<string | null>(() => getYouTubeVideoId(props.show?.preview_url ?? undefined));

const canPlayVideo = computed<boolean>(() => Boolean(props.isShown && videoId.value) && !isVideoError.value);
const activeVideoId = computed<string>(() => videoId.value ?? 'drawer-video');

watch([() => props.show, () => props.isShown], () => {
  isVideoPlaying.value = false;
  isVideoError.value = false;
});

watch(
  () => props.isShown,
  (newVal) => {
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }

    if (newVal) {
      return;
    }

    /** Wait until the drawer close animation finishes. */
    hideTimeoutId = setTimeout(() => {
      isVideoPlaying.value = false;
      isVideoError.value = false;
      isDescriptionExpanded.value = false;
    }, 220);
  },
);
</script>

<template>
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
        :src="props.show?.card_image_url || props.show?.banner_url"
        class="w-100 h-100"
        cover
        v-if="
          ((props.show?.card_image_url || props.show?.banner_url) && (!canPlayVideo || !isVideoPlaying)) || !videoId
        "
      />
    </v-fade-transition>

    <div class="image-shadow position-absolute w-100 h-100 top-0 left-0">
      <section-container class="d-flex flex-column justify-end h-100">
        <div class="d-flex ga-2">
          <v-tooltip v-for="category in props.show?.categories" :key="category.value">
            <template #activator="{ props: tooltipProps }">
              <v-icon :icon="category.icon" color="primary" v-bind="tooltipProps"> </v-icon>
            </template>
            <span>{{ category.name }}</span>
          </v-tooltip>
        </div>

        <h1>{{ getPrimaryTitle(props.show) }}</h1>

        <expandable-text v-model="isDescriptionExpanded" :text="props.show?.description" class="text-medium-emphasis" />
      </section-container>
    </div>

    <v-fade-transition>
      <volume-control
        v-model:muted="isMuted"
        v-model:volume="volume"
        class="position-absolute left-0 top-0 ma-4"
        v-if="isVideoPlaying"
      />
    </v-fade-transition>

    <v-btn
      class="position-absolute right-0 top-0 ma-4"
      color="default"
      icon="mdi-close"
      variant="text"
      @click="emit('close')"
    />
  </div>
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
