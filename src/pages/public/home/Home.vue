<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';

import { computed, onMounted, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { MediaBanner } from '@/components/common/media-banner';
import { TitledSection } from '@/components/common/titled-section';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowCarousel } from '@/components/features/show/show-carousel';
import { ShowGrid } from '@/components/features/show/show-grid';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showService } from '@/services/show/showService';

const continueToWatchShows = ref<Show[]>([]);
const latestShows = ref<Show[]>([]);
const isekaiShows = ref<Show[]>([]);
const romanceShows = ref<Show[]>([]);
const randomShows = ref<Show[]>([]);

const selectedBannerShow = ref<Show | null>(null);
const selectedShow = ref<Show | null>(selectedBannerShow.value);
const isShowDrawerVisible = ref(false);

const { showAPIErrorSnackbar } = useCommonSnackbar();

const { xxl, xlAndUp, lgAndUp, smAndUp } = useDisplay();

const continueWatchingCols = computed(() => {
  if (xxl.value) return 5;
  if (xlAndUp.value) return 4;
  if (lgAndUp.value) return 3;
  if (smAndUp.value) return 2;
  return 1;
});

watch(
  () => selectedBannerShow.value,
  (newVal) => {
    if (newVal) {
      selectedShow.value = newVal;
    }
  },
);

const loadShows = async (): Promise<void> => {
  try {
    const shows = await showService.list({
      sort: '-created_at',
    });

    continueToWatchShows.value = shows;
    latestShows.value = shows;
    isekaiShows.value = shows;
    romanceShows.value = shows;
    randomShows.value = shows;
    selectedBannerShow.value = shows[0] ?? null;
  } catch (error: unknown) {
    continueToWatchShows.value = [];
    latestShows.value = [];
    isekaiShows.value = [];
    romanceShows.value = [];
    randomShows.value = [];
    selectedBannerShow.value = null;
    showAPIErrorSnackbar(error);
  }
};

onMounted(() => {
  void loadShows();
});
</script>

<template>
  <media-banner
    :disable-video-playback="isShowDrawerVisible"
    :image-src="selectedBannerShow?.banner_url || null"
    :video-src="selectedBannerShow?.preview_url || 'https://www.youtube.com/watch?v=QohH89Eu5iM'"
    style="margin-top: -70px; height: 73vh"
  >
    <v-row align="center" style="max-width: 90%">
      <v-col>
        <v-sheet border="sm" class="position-relative glass-panel" rounded="xl">
          <v-container class="pa-8">
            <titled-section icon="mdi-clock-outline" icon-color="warning" title="Latest"> </titled-section>
            <show-grid
              v-model:selected-show="selectedBannerShow"
              :cols="continueWatchingCols"
              :shows="latestShows"
              @click:show="isShowDrawerVisible = true"
            />
            <v-col cols="12" v-if="latestShows.length === 0">
              <v-alert type="info">No shows have been added yet.</v-alert>
            </v-col>
          </v-container>
        </v-sheet>
      </v-col>
    </v-row>
  </media-banner>
  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" :show="selectedShow" />
  <v-container class="pl-12 pr-0 overflow-visible" fluid>
    <v-row gap="48">
      <titled-section
        icon="mdi-play-circle"
        icon-color="warning"
        subtitle="Pick up where you left off with your in-progress shows."
        title="Continue Watching"
      >
        <show-carousel
          v-model:selected-show="selectedShow"
          :shows="continueToWatchShows"
          :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
          drag-class="pl-12 pr-12"
          @click:show="isShowDrawerVisible = true"
        />
        <v-col cols="12" v-if="continueToWatchShows.length === 0">
          <v-alert type="info">There are no shows in this category</v-alert>
        </v-col>
      </titled-section>
      <titled-section
        icon="mdi-earth"
        icon-color="success"
        subtitle="World-hopping stories with larger-than-life stakes."
        title="Isekai"
      >
        <show-carousel
          v-model:selected-show="selectedShow"
          :shows="isekaiShows"
          :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
          drag-class="pl-12 pr-12"
          @click:show="isShowDrawerVisible = true"
        />
        <v-col cols="12" v-if="isekaiShows.length === 0">
          <v-alert type="info">There are no shows in this category</v-alert>
        </v-col>
      </titled-section>
      <titled-section
        icon="mdi-heart"
        icon-color="error"
        subtitle="Softer pacing, sharper emotions, and character chemistry."
        title="Romance"
      >
        <show-carousel
          v-model:selected-show="selectedShow"
          :shows="romanceShows"
          :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
          drag-class="pl-12 pr-12"
          @click:show="isShowDrawerVisible = true"
        />
        <v-col cols="12" v-if="romanceShows.length === 0">
          <v-alert type="info">There are no shows in this category</v-alert>
        </v-col>
      </titled-section>
      <titled-section
        icon="mdi-shuffle-variant"
        icon-color="info"
        subtitle="Unexpected picks when you want the catalog to surprise you."
        title="Random"
      >
        <show-carousel
          v-model:selected-show="selectedShow"
          :shows="randomShows"
          :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
          drag-class="pl-12 pr-12"
          @click:show="isShowDrawerVisible = true"
        />
        <v-col cols="12" v-if="randomShows.length === 0">
          <v-alert type="info">There are no shows in this category</v-alert>
        </v-col>
      </titled-section>
    </v-row>
  </v-container>
</template>
