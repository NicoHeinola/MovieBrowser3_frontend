<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { ExpandableText } from '@/components/common/expandable-text';
import { SectionContainer } from '@/components/common/section-container';
import { VolumeControl } from '@/components/common/volume-control';
import { YouTubePlayer } from '@/components/common/youtube-player';
import { ShowEntrySelect } from '@/components/features/show/show-entry-select';
import { getEpisodeName } from '@/utils/show/getEpisodeName';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getYouTubeEmbedUrl } from '@/utils/youtube/getYouTubeEmbedUrl';

const props = defineProps<{
  show: Show | null;
}>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});
const selectedEntry = ref<ShowEntry | null>(null);

const hideTimeoutId = ref<number | null>(null);

const isDescriptionExpanded = ref<boolean>(false);

const { xlAndUp } = useDisplay();

const isVideoPlaying = ref<boolean>(false);
const isVideoError = ref<boolean>(false);
const isMuted = ref<boolean>(true);
const volume = ref<number>(20);

const close = () => {
  isShown.value = false;
};

const youtubeEmbedUrl = computed<string | null>(() => {
  if (!props.show?.preview_url) return null;
  return getYouTubeEmbedUrl(props.show.preview_url);
});

const videoId = computed<string | null>(() => {
  if (!youtubeEmbedUrl.value) return null;
  const match = youtubeEmbedUrl.value.match(/embed\/([^?]+)/);
  return match ? match[1] : null;
});

const canPlayVideo = computed<boolean>(() => Boolean(isShown.value && videoId.value) && !isVideoError.value);
const activeVideoId = computed<string>(() => videoId.value ?? 'drawer-video');

watch([() => props.show, () => isShown.value], () => {
  selectedEntry.value = null;
  isVideoPlaying.value = false;
  isVideoError.value = false;
});

watch(isShown, (newVal) => {
  if (newVal) {
    return;
  }

  // Wait until drawer closes
  hideTimeoutId.value = setTimeout(() => {
    isVideoPlaying.value = false;
    isVideoError.value = false;
    isDescriptionExpanded.value = false;
  }, 220);
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
          <h1>{{ getPrimaryTitle(props.show) }}</h1>

          <expandable-text
            v-model="isDescriptionExpanded"
            :text="props.show?.description"
            class="text-medium-emphasis"
          />
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
        @click="close"
      />
    </div>

    <section-container class="pt-0">
      <v-row>
        <v-col class="d-flex ga-6 align-center" cols="12">
          <show-entry-select v-model="selectedEntry" :entries="show?.entries" clearable />
          <v-btn :disabled="!selectedEntry" append-icon="mdi-play"> Watch Season </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="episode in selectedEntry?.episodes" cols="12" :key="episode.id">
          <v-btn append-icon="mdi-play" class="max-width-button w-100 justify-start">
            <template #prepend>
              <span class="text-medium-emphasis text-body-small">{{ episode.sequence_number }}</span>
            </template>
            <span class="text-truncate d-flex text-start flex-column">
              {{ getEpisodeName(episode) }}
            </span>
            <v-spacer />
          </v-btn>
        </v-col>
      </v-row>
    </section-container>
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
