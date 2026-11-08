<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

import { MediaPlaceholder } from '@/components/common/media-placeholder';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getShowVideoBytes } from '@/utils/show/getShowVideoBytes';

const props = defineProps<{
  /** The show being edited; the hero follows its unsaved changes as a live preview. */
  show: Show;
  /** Whether the show is being deleted, for the delete button's spinner. */
  isDeleting?: boolean;
  /** Whether saving or deleting is running, which disables the delete button. */
  disabled?: boolean;
}>();

const emit = defineEmits<{
  /** The delete button was clicked; the parent confirms and deletes. */
  delete: [];
}>();

const { t, locale } = useI18n();
const { smAndUp } = useDisplay();

/** The primary title, or an empty string while the new show has none. */
const title = computed<string>(() => getPrimaryTitle(props.show, '').trim());

const entryCount = computed<number>(() => props.show.entries?.length ?? 0);

const episodeCount = computed<number>(() =>
  (props.show.entries ?? []).reduce((count, entry) => count + (entry.episodes?.length ?? 0), 0),
);

/** The saved video files; picked but unsaved files are not measured yet. */
const videoBytes = computed<number>(() => getShowVideoBytes(props.show));
</script>

<template>
  <v-card
    border="sm"
    class="position-relative d-flex align-end"
    min-height="300"
    rounded="xl"
    style="background: rgb(var(--v-theme-surface), 0.6)"
  >
    <v-fade-transition>
      <v-img
        :src="props.show.banner_url"
        class="show-editor-hero__banner position-absolute top-0 left-0 w-100 h-100"
        cover
        :key="props.show.banner_url"
        v-if="props.show.banner_url"
      />
    </v-fade-transition>

    <div class="position-relative w-100 d-flex align-end ga-6 pa-6 pa-md-8">
      <v-sheet
        :width="smAndUp ? 150 : 96"
        border="sm"
        class="flex-shrink-0 overflow-hidden"
        color="surface"
        elevation="8"
        rounded="lg"
        style="aspect-ratio: 2 / 3"
      >
        <v-fade-transition>
          <v-img
            :src="props.show.card_image_url"
            class="h-100"
            cover
            :key="props.show.card_image_url"
            v-if="props.show.card_image_url"
          />
        </v-fade-transition>
        <div class="h-100 d-flex align-center justify-center pa-2 text-center" v-if="!props.show.card_image_url">
          <media-placeholder :text="t('show.noCardImage')" icon="mdi-image-off-outline" />
        </div>
      </v-sheet>

      <div class="d-flex flex-column ga-2" style="min-width: 0">
        <p class="text-label-large text-uppercase text-medium-emphasis">
          {{ props.show.id ? t('showEditor.editLabel') : t('showEditor.newLabel') }}
        </p>
        <h1 :class="{ 'text-disabled': !title }" style="overflow-wrap: anywhere; line-height: 1.15">
          {{ title || t('showEditor.untitled') }}
        </h1>

        <div class="d-flex flex-wrap ga-2" v-if="(props.show.categories?.length ?? 0) > 0">
          <v-chip
            v-for="category in props.show.categories"
            :prepend-icon="category.icon"
            class="glass-panel high"
            color="primary"
            size="small"
            variant="tonal"
            :key="category.id"
          >
            {{ category.name }}
          </v-chip>
        </div>

        <div class="d-flex flex-wrap ga-4 text-body-medium text-medium-emphasis">
          <span class="d-flex align-center ga-2">
            <v-icon icon="mdi-playlist-play" size="small" />
            {{ t('showEditor.entryCount', { count: entryCount }, entryCount) }}
          </span>
          <span class="d-flex align-center ga-2">
            <v-icon icon="mdi-filmstrip" size="small" />
            {{ t('showEditor.episodeCount', { count: episodeCount }, episodeCount) }}
          </span>
          <span class="d-flex align-center ga-2" v-if="videoBytes > 0">
            <v-icon icon="mdi-harddisk" size="small" />
            {{ formatFileSize(videoBytes, locale) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Last, so it paints above the content row, which spans the whole card. -->
    <v-btn
      :disabled="props.disabled"
      :loading="props.isDeleting"
      class="glass-panel position-absolute top-0 right-0 ma-4"
      color="error"
      prepend-icon="mdi-trash-can-outline"
      variant="tonal"
      @click="emit('delete')"
      v-if="props.show.id"
    >
      {{ t('showEditor.deleteShow') }}
    </v-btn>
  </v-card>
</template>

<style lang="scss" scoped>
// The banner fades out towards the bottom left, so the poster and the title stay readable on any image.
.show-editor-hero__banner {
  filter: brightness(0.75);
  mask-image: linear-gradient(to top right, rgb(0 0 0 / 10%) 15%, rgb(0 0 0 / 100%) 75%);
}
</style>
