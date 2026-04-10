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
import { useSettingStore } from '@/stores/setting/useSettingStore';

const continueToWatchShows = ref<Show[]>([]);
const latestShows = ref<Show[]>([]);
const isekaiShows = ref<Show[]>([]);
const romanceShows = ref<Show[]>([]);
const randomShows = ref<Show[]>([]);

const selectedBannerShow = ref<Show | null>(null);
const selectedShow = ref<Show | null>(selectedBannerShow.value);
const isShowDrawerVisible = ref<boolean>(false);

const settingStore = useSettingStore();
const { showAPIErrorSnackbar } = useCommonSnackbar();

const { xxl, xlAndUp, lgAndUp, smAndUp } = useDisplay();

const continueWatchingCols = computed<number>(() => {
  if (xxl.value) return 5;
  if (xlAndUp.value) return 4;
  if (lgAndUp.value) return 3;
  if (smAndUp.value) return 2;
  return 1;
});

const bannerVideo = computed<string | null>(() => {
  if (selectedBannerShow.value?.preview_url) {
    return selectedBannerShow.value.preview_url;
  }

  const defaultVideos = settingStore.bannerDefaultVideos;
  if (defaultVideos.length > 0) {
    return defaultVideos[Math.floor(Math.random() * defaultVideos.length)];
  }

  return null;
});

const bannerBackground = computed<string | null>(() => {
  if (selectedBannerShow.value?.banner_url) {
    return selectedBannerShow.value.banner_url;
  }

  const defaultBackgrounds = settingStore.bannerDefaultBackgrounds;
  if (defaultBackgrounds.length > 0) {
    return defaultBackgrounds[Math.floor(Math.random() * defaultBackgrounds.length)];
  }

  return null;
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
    :image-src="bannerBackground"
    :video-src="bannerVideo"
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
            <div class="d-flex" v-if="latestShows.length === 0">
              <v-alert class="flex-0-0" type="info">
                <p class="text-no-wrap">No shows have been added yet.</p>
              </v-alert>
            </div>
          </v-container>
        </v-sheet>
      </v-col>
    </v-row>
  </media-banner>
  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" :show="selectedShow" />
  <v-container class="pb-12 pl-12 pr-0 overflow-visible" fluid>
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
        <div class="d-flex" v-if="continueToWatchShows.length === 0">
          <v-alert class="flex-0-0" type="info">
            <p class="text-no-wrap">There are no shows in this category</p>
          </v-alert>
        </div>
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
        <div class="d-flex" v-if="isekaiShows.length === 0">
          <v-alert class="flex-0-0" type="info">
            <p class="text-no-wrap">There are no shows in this category</p>
          </v-alert>
        </div>
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
        <div class="d-flex" v-if="romanceShows.length === 0">
          <v-alert class="flex-0-0" type="info">
            <p class="text-no-wrap">There are no shows in this category</p>
          </v-alert>
        </div>
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
        <div class="d-flex" v-if="randomShows.length === 0">
          <v-alert class="flex-0-0" type="info">
            <p class="text-no-wrap">There are no shows in this category</p>
          </v-alert>
        </div>
      </titled-section>
    </v-row>
  </v-container>
</template>
