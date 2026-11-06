<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { MediaPlaceholder } from '@/components/common/media-placeholder';
import { useBannerPreviewDialog } from '@/composables/dialog/useBannerPreviewDialog';
import { getYouTubeThumbnailUrl } from '@/utils/youtube/getYouTubeThumbnailUrl';
import { getYouTubeVideoId } from '@/utils/youtube/getYouTubeVideoId';

const props = withDefaults(
  defineProps<{
    /** The image to show. */
    imageSrc?: string | null;
    /** The YouTube url to show. */
    videoSrc?: string | null;
    /** The height of the media area, in pixels. */
    height?: number;
    /** The text shown while there is no media. */
    placeholderText: string;
    /** The icon shown while there is no media. */
    placeholderIcon?: string;
    /** Turns off the home page preview, for media that never appears on the banner. */
    disablePreview?: boolean;
  }>(),
  {
    imageSrc: null,
    videoSrc: null,
    height: 300,
    placeholderIcon: 'mdi-image-off-outline',
    disablePreview: false,
  },
);

const { t } = useI18n();
const { showBannerPreview } = useBannerPreviewDialog();

const videoId = computed<string | null>(() => getYouTubeVideoId(props.videoSrc ?? undefined));

/** The image shown in the card, which falls back to the video's own thumbnail. */
const thumbnailUrl = computed<string | undefined>(() => {
  if (props.imageSrc) {
    return props.imageSrc;
  }

  return videoId.value ? getYouTubeThumbnailUrl(videoId.value) : undefined;
});

const canPreview = computed<boolean>(() => Boolean(thumbnailUrl.value) && !props.disablePreview);
</script>

<template>
  <v-card :class="{ 'zoom-on-hover': canPreview }" :image="thumbnailUrl" border="sm">
    <!-- Holds the card's height, because the button below is taken out of the flow to cover the whole card. -->
    <div :style="{ height: `${props.height}px` }" />

    <!-- A real button, type="button" so that clicking it inside a form never submits the form. -->
    <button
      :aria-label="t('common.previewOnHome')"
      :disabled="!canPreview"
      :style="{
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: canPreview ? 'pointer' : 'default',
      }"
      class="d-flex align-center justify-center position-absolute top-0 left-0 w-100 h-100"
      type="button"
      @click="void showBannerPreview({ imageSrc: props.imageSrc, videoSrc: props.videoSrc })"
      v-tooltip:bottom="{ text: t('common.previewOnHome'), disabled: !canPreview }"
    >
      <v-slide-y-transition>
        <media-placeholder :icon="props.placeholderIcon" :text="props.placeholderText" v-if="!thumbnailUrl" />
      </v-slide-y-transition>

      <v-avatar class="glass-panel position-absolute top-0 right-0 ma-2" size="32" v-if="thumbnailUrl">
        <v-icon :icon="videoId ? 'mdi-youtube' : 'mdi-image-outline'" size="small" />
      </v-avatar>
    </button>

    <!-- Positioned so that it stays above the button and its field keeps working. -->
    <v-card-actions class="position-relative">
      <slot />
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.zoom-on-hover {
  :deep(.v-img) {
    transition: transform 0.3s ease-in-out;
  }

  // Only the button opens the preview, so hovering the field on top of it must not zoom.
  &:has(> button:hover) :deep(.v-img) {
    transform: scale(1.05);
  }
}
</style>
