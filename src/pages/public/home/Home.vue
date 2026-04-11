<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';

import { computed, onMounted, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { MediaBanner } from '@/components/common/media-banner';
import PageContainer from '@/components/common/page-container/PageContainer.vue';
import SectionContainer from '@/components/common/section-container/SectionContainer.vue';
import { TitledSection } from '@/components/common/titled-section';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowCarousel } from '@/components/features/show/show-carousel';
import { ShowGrid } from '@/components/features/show/show-grid';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showService } from '@/services/show/showService';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import { homepageSections } from './homepageSections';

const continueToWatchShows = ref<Show[]>([]);
const latestShows = ref<Show[]>([]);
const isekaiShows = ref<Show[]>([]);
const romanceShows = ref<Show[]>([]);
const randomShows = ref<Show[]>([]);

const showsMap = computed<Record<string, Show[]>>(() => ({
  continueToWatchShows: continueToWatchShows.value,
  isekaiShows: isekaiShows.value,
  romanceShows: romanceShows.value,
  randomShows: randomShows.value,
}));

const isLoadingShows = ref<boolean>(false);
const selectedBannerShow = ref<Show | null>(null);
const selectedShow = ref<Show | null>(null);
const isShowDrawerVisible = ref<boolean>(false);
const isPlayingCardVideo = ref<boolean>(false);
let bannerResumeTimeout: ReturnType<typeof setTimeout> | null = null;

const settingStore = useSettingStore();
const { showAPIErrorSnackbar } = useCommonSnackbar();

const isLoading = computed<boolean>(() => settingStore.isLoading || isLoadingShows.value);

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

const onPlayingVideoUpdate = (isPlaying: boolean) => {
  if (bannerResumeTimeout) {
    clearTimeout(bannerResumeTimeout);
    bannerResumeTimeout = null;
  }

  if (isPlaying) {
    isPlayingCardVideo.value = true;
  } else {
    bannerResumeTimeout = setTimeout(() => {
      isPlayingCardVideo.value = false;
    }, 700);
  }
};

watch(
  () => selectedBannerShow.value,
  (newVal) => {
    if (newVal) {
      selectedShow.value = newVal;
    }
  },
);

const loadShows = async (): Promise<void> => {
  isLoadingShows.value = true;
  try {
    const [continueToWatch, latest, isekai, romance, random] = await Promise.all([
      showService.list({ sort: '-created_at', page: { size: 10 } }),
      showService.list({ sort: '-created_at', page: {} }),
      showService.list({ sort: '-created_at', page: {} }),
      showService.list({ sort: '-created_at', page: {} }),
      showService.list({ sort: 'random', page: {} }),
    ]);

    continueToWatchShows.value = continueToWatch.data;
    latestShows.value = latest.data;
    isekaiShows.value = isekai.data;
    romanceShows.value = romance.data;
    randomShows.value = random.data;
  } catch (error: unknown) {
    continueToWatchShows.value = [];
    latestShows.value = [];
    isekaiShows.value = [];
    romanceShows.value = [];
    randomShows.value = [];
    selectedBannerShow.value = null;
    showAPIErrorSnackbar(error);
  } finally {
    isLoadingShows.value = false;
  }
};

onMounted(() => {
  void loadShows();
});
</script>

<template>
  <media-banner
    :disable-video-playback="isShowDrawerVisible || isPlayingCardVideo"
    :image-src="bannerBackground"
    :video-src="bannerVideo"
    style="margin-top: -70px; height: 74.5vh"
  >
    <v-row align="center" style="max-width: 90%">
      <v-sheet border="sm" class="position-relative glass-panel" rounded="xl">
        <section-container>
          <titled-section icon="mdi-clock-outline" icon-color="warning" title="Latest"> </titled-section>
          <template v-if="isLoading">
            <div class="d-flex ga-8">
              <v-skeleton-loader v-for="i in continueWatchingCols" type="image@2, paragraph" width="300" :key="i" />
            </div>
          </template>
          <template v-else>
            <show-grid
              :cols="continueWatchingCols"
              :selected-show="selectedBannerShow"
              :shows="latestShows.map((show) => ({ ...show, preview_url: null }))"
              @click:show="isShowDrawerVisible = true"
              @update:selected-show="
                (show: Show | null) => (selectedBannerShow = latestShows.find((s) => s.id === show?.id) ?? null)
              "
            ></show-grid>
            <div class="d-flex" v-if="latestShows.length === 0">
              <v-alert class="flex-0-0" type="info">
                <p class="text-no-wrap">No shows have been added yet.</p>
              </v-alert>
            </div>
          </template>
        </section-container>
      </v-sheet>
    </v-row>
  </media-banner>
  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" :show="selectedShow" />
  <page-container class="pr-0 pt-0" fluid>
    <v-row gap="48">
      <titled-section
        v-for="section in homepageSections"
        :icon="section.icon"
        :icon-color="section.iconColor"
        :subtitle="section.subtitle"
        :title="section.title"
        :key="section.title"
      >
        <v-skeleton-loader type="image" v-if="isLoading" />
        <show-carousel
          v-model:selected-show="selectedShow"
          :shows="showsMap[section.dataKey]"
          :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
          drag-class="pl-12 pr-12"
          @click:show="isShowDrawerVisible = true"
          @playing-video="onPlayingVideoUpdate"
          v-else
        />
        <div class="d-flex" v-if="!isLoading && showsMap[section.dataKey].length === 0">
          <v-alert class="flex-0-0" type="info">
            <p class="text-no-wrap">There are no shows in this category</p>
          </v-alert>
        </div>
      </titled-section>
    </v-row>
  </page-container>
</template>
