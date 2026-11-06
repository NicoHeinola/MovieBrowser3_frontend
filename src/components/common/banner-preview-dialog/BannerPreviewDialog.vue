<script setup lang="ts">
import type { BannerPreviewDialogProps } from './bannerPreviewDialogProps';

import { useI18n } from 'vue-i18n';

import { HOME_BANNER_HEIGHT, MediaBanner } from '@/components/common/media-banner';

const props = withDefaults(defineProps<BannerPreviewDialogProps>(), {
  imageSrc: null,
  videoSrc: null,
});

const { t } = useI18n();
</script>

<template>
  <v-dialog :model-value="props.modelValue" fullscreen @update:model-value="props.close()">
    <v-sheet class="position-relative overflow-hidden h-100" color="background">
      <!-- Same size as on the home page, where the banner also starts at the top edge, behind the navigation. -->
      <media-banner :image-src="props.imageSrc" :style="{ height: HOME_BANNER_HEIGHT }" :video-src="props.videoSrc" />

      <v-btn
        :aria-label="t('common.close')"
        class="position-absolute top-0 right-0 ma-4 glass-panel"
        color="primary"
        icon="mdi-close"
        @click="props.close()"
      />
    </v-sheet>
  </v-dialog>
</template>
