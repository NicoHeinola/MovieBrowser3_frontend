<script setup lang="ts">
import type { BannerPreviewDialogProps } from './bannerPreviewDialogProps';
import type { Show } from '@/interfaces/api/models/Show';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { HOME_BANNER_HEIGHT, MediaBanner } from '@/components/common/media-banner';
import { LATEST_SHOWS_MAX_COLS, LatestShowsPanel } from '@/components/features/show/latest-shows-panel';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';

const props = withDefaults(defineProps<BannerPreviewDialogProps>(), {
  imageSrc: null,
  videoSrc: null,
});

/** Whether the latest shows panel covers the banner, as it does on the home page. */
const showLatestShows = ref<boolean>(true);

/** Whether the navigation bar covers the top of the banner, as it does on the home page. */
const showNavigation = ref<boolean>(true);

const { t } = useI18n();

const latestShowsQuery = useAPIQuery<Show[]>({
  queryKey: [ShowQueryKey.BannerPreviewLatestShows],
  queryFn: async () => {
    const response = await showService.list({ sort: '-created_at', page: { size: LATEST_SHOWS_MAX_COLS } });

    return response.data;
  },
  // Nothing needs the shows while the panel is hidden.
  enabled: showLatestShows,
});
</script>

<template>
  <v-dialog :model-value="props.modelValue" fullscreen @update:model-value="props.close()">
    <v-sheet class="position-relative overflow-hidden h-100" color="background">
      <!-- Same size as on the home page, where the banner also starts at the top edge, behind the navigation. -->
      <media-banner :image-src="props.imageSrc" :style="{ height: HOME_BANNER_HEIGHT }" :video-src="props.videoSrc">
        <!-- Only for looking at: clicking a show here has nothing to open. -->
        <latest-shows-panel
          :loading="latestShowsQuery.isLoading.value"
          :shows="latestShowsQuery.data.value ?? []"
          style="pointer-events: none"
          v-if="showLatestShows"
        />
      </media-banner>

      <!-- The fade of the real navigation bar, which is too heavy to mount here: only what it darkens matters. -->
      <div
        class="position-absolute top-0 left-0 w-100"
        style="height: 64px; background: linear-gradient(to bottom, rgb(var(--v-theme-background), 0.67), transparent)"
        v-if="showNavigation"
      />

      <v-btn
        :aria-label="t('common.close')"
        class="position-absolute top-0 right-0 ma-4 glass-panel"
        icon="mdi-close"
        @click="props.close()"
      />

      <div class="position-absolute bottom-0 left-0 w-100 d-flex justify-center pa-4">
        <v-sheet class="d-flex ga-4 px-4" rounded="lg">
          <v-switch v-model="showLatestShows" :label="t('bannerPreview.latestShows')" color="primary" hide-details />
          <v-switch v-model="showNavigation" :label="t('bannerPreview.navigation')" color="primary" hide-details />
        </v-sheet>
      </div>
    </v-sheet>
  </v-dialog>
</template>
