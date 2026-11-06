<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { MediaPreviewCard } from '@/components/common/media-preview-card';

const props = withDefaults(
  defineProps<{
    /** The urls of the images or videos. */
    urls: string[];
    /** Whether the urls are still loading. */
    loading: boolean;
    /** The text shown when there are no urls. */
    emptyText: string;
    /** Whether the urls are YouTube videos instead of images. */
    isVideo?: boolean;
  }>(),
  {
    isVideo: false,
  },
);

const { t } = useI18n();
</script>

<template>
  <v-skeleton-loader type="card" width="390" v-if="props.loading" />

  <div class="d-flex" v-else-if="props.urls.length === 0">
    <v-alert class="flex-0-1" type="info" border> {{ props.emptyText }} </v-alert>
  </div>

  <v-row v-else>
    <v-col v-for="url in props.urls" cols="auto" :key="url">
      <media-preview-card
        :height="220"
        :image-src="props.isVideo ? null : url"
        :placeholder-icon="props.isVideo ? 'mdi-youtube' : undefined"
        :placeholder-text="t('settings.previewUnavailable')"
        :video-src="props.isVideo ? url : null"
        width="390"
      >
        <div class="d-flex align-center ga-2 w-100">
          <!-- min-width lets the strip shrink, or a long url would push the appended content out of the card. -->
          <div class="d-flex glass-panel rounded-lg pa-2 flex-1-1" style="min-width: 0">
            <a :href="url" class="text-medium-emphasis link text-truncate" rel="noopener noreferrer" target="_blank">
              {{ url }}
            </a>
          </div>

          <slot :url="url" name="append" />
        </div>
      </media-preview-card>
    </v-col>
  </v-row>
</template>
