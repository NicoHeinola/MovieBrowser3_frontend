<script lang="ts" setup>
import type { Show } from '@/interfaces/api/models/Show';
import { computed, onBeforeUnmount, ref } from 'vue';

import { YouTubePlayer } from '@/components/common/youtube-player';
import { useLongPress } from '@/composables/pointer/useLongPress';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getShowWatchStatusColor } from '@/utils/show/getShowWatchStatusColor';
import { getYouTubeVideoId } from '@/utils/youtube/getYouTubeVideoId';

const props = withDefaults(
  defineProps<{
    show: Show;
    imageToUse?: 'card' | 'banner';
    width?: string | number;
    height?: string | number;
    /** Shows a play hint, since a click starts playback instead of opening the show. */
    playOnClick?: boolean;
  }>(),
  {
    imageToUse: 'banner',
    width: '300px',
    height: '400px',
    playOnClick: false,
  },
);

const emit = defineEmits<{
  (e: 'playing-video', value: boolean): void;
  (e: 'hold'): void;
}>();

const isHovered = ref(false);
const showVideo = ref(false);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

const longPressHandlers = useLongPress(() => emit('hold'));

const playHint = 'Clicking the card starts playback. Hold the card to open the show instead.';

const cardImage = computed<string>(() => {
  if (props.imageToUse === 'card') return props.show.card_image_url;
  return props.show.banner_url;
});

const videoId = computed<string | null>(() => {
  if (!showVideo.value) return null;
  return getYouTubeVideoId(props.show.preview_url ?? undefined);
});

const onMouseEnter = () => {
  isHovered.value = true;

  if (!props.show.preview_url) return;

  hoverTimeout = setTimeout(() => {
    showVideo.value = true;
    emit('playing-video', true);
  }, 700);
};

const onMouseLeave = () => {
  isHovered.value = false;

  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  if (showVideo.value) {
    showVideo.value = false;
    emit('playing-video', false);
  }
};

const primaryTitle = computed<string>(() => getPrimaryTitle(props.show));

/** Single status color, gray when statuses are mixed or incomplete, `null` when none is set. */
const watchStatusColor = computed<string | null>(() => getShowWatchStatusColor(props.show));

/** A card can unmount while hovered (e.g. on refetch); release the parent's "playing" state with it. */
onBeforeUnmount(() => {
  onMouseLeave();
});
</script>

<template>
  <v-card
    :height="props.height"
    :min-width="props.width"
    :width="props.width"
    border="sm"
    class="show-card"
    v-on="props.playOnClick ? longPressHandlers : {}"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- v-lazy cross-fades its slot, so both layers are stacked to keep the outgoing one from pushing the other down. -->
    <v-lazy class="h-100 position-relative">
      <v-img
        :src="cardImage"
        class="position-absolute top-0 left-0 h-100 w-100"
        style="pointer-events: none"
        cover
        v-if="!videoId"
      ></v-img>
      <div class="position-absolute top-0 left-0 h-100 w-100" style="pointer-events: none; overflow: hidden" v-else>
        <you-tube-player :video-id="videoId" class="h-100 w-100" style="transform: scale(1.2)" />
      </div>
    </v-lazy>
    <div class="card-shadow position-absolute bottom-0 left-0 w-100" style="height: 20%" />
    <div class="position-absolute bottom-0 left-0 px-4 my-4 text-truncate" style="cursor: pointer; max-width: 100%">
      <p
        class="card-title text-truncate text-grey-lighten-2 ma-0 font-weight-bold"
        style="text-shadow: 0 0 5px black"
        v-tooltip:top="primaryTitle"
      >
        {{ primaryTitle }}
      </p>
    </div>
    <v-fade-transition>
      <v-icon
        class="position-absolute top-0 right-0 ma-2"
        icon="mdi-play-circle"
        size="x-large"
        v-tooltip:top="playHint"
        v-if="props.playOnClick && isHovered"
      />
    </v-fade-transition>
    <div
      :class="`bg-${watchStatusColor}`"
      class="position-absolute bottom-0 w-100"
      style="height: 3px"
      v-if="watchStatusColor"
    ></div>
  </v-card>
</template>

<style lang="scss" scoped>
.show-card {
  transition:
    transform 0.3s ease-in-out,
    border-color 0.3s ease-in-out,
    filter 0.3s ease-in-out;

  :deep(.v-img) {
    transition:
      transform 0.3s ease-in-out,
      filter 0.3s ease-in-out;

    transform: scale(1.22) translateY(0px);
  }

  &:hover {
    transform: translateY(-12px) scale(1.04);
    filter: brightness(105%);
    z-index: 100;

    border-color: rgb(var(--v-theme-secondary)) !important;

    :deep(.v-img) {
      cursor: pointer;
      transform: scale(1.14) translateY(12px);
      filter: contrast(120%) brightness(90%);
    }

    .card-title {
      color: rgb(var(--v-theme-secondary));
    }
  }

  .card-title {
    transition: color 0.3s ease-in-out;
  }

  .card-shadow {
    background: linear-gradient(
      to top,
      rgb(var(--v-theme-background), 0.96),
      rgb(var(--v-theme-background), 0.48) 48%,
      transparent 100%
    );
    opacity: 0.7;
    pointer-events: none;
  }
}
</style>
