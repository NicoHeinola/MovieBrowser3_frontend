<script setup lang="ts">
import type { HomepageSection } from './HomepageSection';
import type { HomeShowsResponse } from './HomeShowsResponse';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowSection } from '@/interfaces/api/models/ShowSection';

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
import { showSectionService } from '@/services/show/showSectionService';
import { showService } from '@/services/show/showService';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { deepClone } from '@/utils/clone/deepClone';
import { homepageSections } from './homepageSections';

/** Latest shows are fetched for the widest layout and trimmed by the grid, so resizing never refetches. */
const MAX_BANNER_COLS = 5;

const selectedBannerShow = ref<Show | null>(null);
const selectedShow = ref<Show | null>(null);
const isShowDrawerVisible = ref<boolean>(false);
const isPlayingCardVideo = ref<boolean>(false);
let bannerResumeTimeout: ReturnType<typeof setTimeout> | null = null;

const settingStore = useSettingStore();

const { xxl, xlAndUp, lgAndUp, smAndUp } = useDisplay();

const bannerMaxCols = computed<number>(() => {
  if (xxl.value) return MAX_BANNER_COLS;
  if (xlAndUp.value) return 4;
  if (lgAndUp.value) return 3;
  if (smAndUp.value) return 2;
  return 1;
});

const showsQuery = useAPIQuery<HomeShowsResponse>({
  queryKey: [ShowQueryKey.HomeShows],
  queryFn: async () => {
    const [latest, continueToWatch, random, sections] = await Promise.all([
      showService.list({ sort: '-created_at', page: { size: MAX_BANNER_COLS } }),
      showService.list({ sort: '-created_at', page: { size: 20 } }),
      showService.list({ sort: 'random', page: { size: 20 } }),
      showSectionService.list({ sort: 'sort_order', page: { number: 0, size: 0 } }),
    ]);

    const sectionShows = await Promise.all(
      sections.data.map((section: ShowSection) =>
        showService.list({
          filter: { 'categories.value': section.category.value },
          sort: '-created_at',
          page: { size: 20 },
        }),
      ),
    );

    return {
      latestShows: latest.data,
      continueToWatchShows: continueToWatch.data,
      randomShows: random.data,
      categorySections: sections.data.map((section: ShowSection) => ({
        title: section.category.name,
        subtitle: section.description ?? '',
        icon: section.category.icon,
        iconColor: 'primary',
        dataKey: `showSection-${section.id}`,
        lazyLoad: true,
      })),
      categoryShows: Object.fromEntries(
        sections.data.map((section: ShowSection, index: number) => [
          `showSection-${section.id}`,
          sectionShows[index]?.data ?? [],
        ]),
      ),
    };
  },
  placeholderData: {
    latestShows: [],
    continueToWatchShows: [],
    randomShows: [],
    categorySections: [],
    categoryShows: {},
  },
});

const sections = computed<HomepageSection[]>(() => [
  ...homepageSections,
  ...(showsQuery.data.value?.categorySections ?? []),
]);

const showMap = computed<Record<string, Show[]>>(() => ({
  continueToWatchShows: showsQuery.data.value?.continueToWatchShows ?? [],
  randomShows: showsQuery.data.value?.randomShows ?? [],
  ...showsQuery.data.value?.categoryShows,
}));

const isLoading = computed<boolean>(() => settingStore.isLoading || showsQuery.isFetching.value);

/** Banner cards don't play previews; the banner itself plays the hovered show's video. */
const latestBannerShows = computed<Show[]>(() =>
  (showsQuery.data.value?.latestShows ?? []).map((show: Show) => ({ ...show, preview_url: null })),
);

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
  () => {
    if (selectedBannerShow.value) {
      selectedShow.value = deepClone(selectedBannerShow.value);
    }
  },
);
</script>

<template>
  <page-background
    :background-style="{
      background: [
        'linear-gradient(180deg,',
        'rgb(var(--v-theme-background)) 74.5vh,',
        'rgb(var(--v-theme-background-lighten-1)) 2000px)',
      ].join(' '),
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
              :shows="latestBannerShows"
              @click:show="isShowDrawerVisible = true"
              @update:selected-show="
                (show: Show | null) =>
                  (selectedBannerShow = showsQuery.data.value?.latestShows.find((s: Show) => s.id === show?.id) ?? null)
              "
            ></show-grid>
            <div class="d-flex" v-if="(showsQuery.data.value?.latestShows?.length ?? 0) === 0">
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
      <v-col v-for="section in sections" cols="12" :key="section.dataKey">
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
              :shows="showMap[section.dataKey] ?? []"
              :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
              drag-class="pl-12 pr-12"
              @click:show="isShowDrawerVisible = true"
              @playing-video="onPlayingVideoUpdate"
              v-else
            />

            <div class="d-flex" v-if="!isLoading && (showMap[section.dataKey]?.length ?? 0) === 0">
              <v-alert class="flex-0-0" type="info">
                <p class="text-no-wrap">There are no shows in this category</p>
              </v-alert>
            </div>
          </titled-section>
        </component>
      </v-col>
    </v-row>
  </page-container>

  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" v-model:show="selectedShow" />
</template>
