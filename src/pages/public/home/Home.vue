<script setup lang="ts">
import type { HomeShowsResponse } from './HomeShowsResponse';
import type { Show } from '@/interfaces/api/models/Show';

import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { VCol, VLazy, VRow } from 'vuetify/components';
import { MediaBanner } from '@/components/common/media-banner';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { SectionContainer } from '@/components/common/section-container';
import { TitledSection } from '@/components/common/titled-section';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowCarousel } from '@/components/features/show/show-carousel';
import { ShowGrid } from '@/components/features/show/show-grid';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { homepageSections } from './homepageSections';

const selectedBannerShow = ref<Show | null>(null);
const selectedShow = ref<Show | null>(null);
const isShowDrawerVisible = ref<boolean>(false);
const isPlayingCardVideo = ref<boolean>(false);
let bannerResumeTimeout: ReturnType<typeof setTimeout> | null = null;

const settingStore = useSettingStore();

const { xxl, xlAndUp, lgAndUp, smAndUp } = useDisplay();

const bannerMaxCols = computed<number>(() => {
  if (xxl.value) return 5;
  if (xlAndUp.value) return 4;
  if (lgAndUp.value) return 3;
  if (smAndUp.value) return 2;
  return 1;
});

const showsQuery = useAPIQuery<HomeShowsResponse>({
  queryKey: [ShowQueryKey.HomeShows, bannerMaxCols],
  queryFn: async () => {
    const [latest, continueToWatch, isekai, romance, random] = await Promise.all([
      showService.list({ sort: '-created_at', page: { size: bannerMaxCols.value } }),
      showService.list({ sort: '-created_at', page: { size: 20 } }),
      showService.list({ sort: '-created_at', page: { size: 20 } }),
      showService.list({ sort: '-created_at', page: { size: 20 } }),
      showService.list({ sort: 'random', page: { size: 20 } }),
    ]);

    return {
      latestShows: latest.data,
      continueToWatchShows: continueToWatch.data,
      isekaiShows: isekai.data,
      romanceShows: romance.data,
      randomShows: random.data,
    };
  },
});

const showMap = computed<Record<string, Show[]>>(() => ({
  continueToWatchShows: showsQuery.data.value?.continueToWatchShows ?? [],
  isekaiShows: showsQuery.data.value?.isekaiShows ?? [],
  romanceShows: showsQuery.data.value?.romanceShows ?? [],
  randomShows: showsQuery.data.value?.randomShows ?? [],
}));

const isLoading = computed<boolean>(() => settingStore.isLoading || showsQuery.isLoading.value);

const bannerVideo = computed<string | null>(() => {
  if (selectedBannerShow.value) {
    return selectedBannerShow.value?.preview_url;
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
</script>

<template>
  <page-background
    :background-style="{
      background:
        'linear-gradient(180deg, rgb(var(--v-theme-background)) 74.5vh, rgb(var(--v-theme-background-lighten-1)) 2000px)',
    }"
    :pattern-style="{
      clipPath: 'inset(71vh 0 0 0)',
      background: [
        'linear-gradient(180deg,',
        'rgba(var(--v-theme-pattern-start), 0) 71vh,',
        'rgba(var(--v-theme-pattern-start), 0.1) 80vh,',
        'rgba(var(--v-theme-pattern-start), 0.25) 85vh,',
        'rgba(var(--v-theme-pattern-start), 0.2) 90vh,',
        'rgba(var(--v-theme-pattern-end), 0.2) 100%)',
      ].join(' '),
      opacity: '0.4',
    }"
  />
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
              <v-skeleton-loader v-for="i in bannerMaxCols" type="image@2, paragraph" width="300" :key="i" />
            </div>
          </template>
          <template v-else>
            <show-grid
              :cols="bannerMaxCols"
              :selected-show="selectedBannerShow"
              :shows="showsQuery.data.value?.latestShows.map((show: Show) => ({ ...show, preview_url: null })) ?? []"
              @click:show="isShowDrawerVisible = true"
              @update:selected-show="
                (show: Show | null) =>
                  (selectedBannerShow = showsQuery.data.value?.latestShows.find((s: Show) => s.id === show?.id) ?? null)
              "
            ></show-grid>
            <div class="d-flex" v-if="showsQuery.data.value?.latestShows.length === 0">
              <v-alert class="flex-0-0" type="info">
                <p class="text-no-wrap">No shows have been added yet.</p>
              </v-alert>
            </div>
          </template>
        </section-container>
      </v-sheet>
    </v-row>
  </media-banner>

  <page-container class="pr-0 pt-0" fluid>
    <v-row gap="48">
      <v-col v-for="section in homepageSections" cols="12" :key="section.title">
        <component :is="section.lazyLoad ? VLazy : 'div'">
          <titled-section
            :icon="section.icon"
            :icon-color="section.iconColor"
            :subtitle="section.subtitle"
            :title="section.title"
          >
            <v-skeleton-loader type="image" v-if="isLoading" />

            <show-carousel
              v-model:selected-show="selectedShow"
              :shows="showMap[section.dataKey]"
              :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
              drag-class="pl-12 pr-12"
              @click:show="isShowDrawerVisible = true"
              @playing-video="onPlayingVideoUpdate"
              v-else
            />

            <div class="d-flex" v-if="!isLoading && showMap[section.dataKey].length === 0">
              <v-alert class="flex-0-0" type="info">
                <p class="text-no-wrap">There are no shows in this category</p>
              </v-alert>
            </div>
          </titled-section>
        </component>
      </v-col>
    </v-row>
  </page-container>

  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" :show="selectedShow" />
</template>
