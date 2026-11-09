<script setup lang="ts">
import type { HomepageSection } from './HomepageSection';
import type { HomeShowsResponse } from './HomeShowsResponse';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowSection } from '@/interfaces/api/models/ShowSection';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { VCol, VLazy, VRow } from 'vuetify/components';
import { HOME_BANNER_HEIGHT, MediaBanner } from '@/components/common/media-banner';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { LATEST_SHOWS_MAX_COLS, LatestShowsPanel } from '@/components/features/show/latest-shows-panel';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowCarousel } from '@/components/features/show/show-carousel';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useHomeBanner } from '@/composables/show/useHomeBanner';
import { useShowPlayback } from '@/composables/show/useShowPlayback';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showSectionService } from '@/services/show/showSectionService';
import { showService } from '@/services/show/showService';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { WATCHED_SHOW_STATUSES } from '@/utils/show/watch-status/watchedShowStatuses';
import { homepageSections } from './homepageSections';

const selectedShowId = ref<number | null>(null);
const isShowDrawerVisible = ref<boolean>(false);
const isPlayingCardVideo = ref<boolean>(false);
let bannerResumeTimeout: ReturnType<typeof setTimeout> | null = null;

const settingStore = useSettingStore();
const { playShow, startingShowId } = useShowPlayback();
const {
  selectedShow: selectedBannerShow,
  isPointerOver: isPointerOverBannerCard,
  background: bannerBackground,
} = useHomeBanner(() => settingStore.bannerDefaultBackgrounds, isShowDrawerVisible);

const { t } = useI18n();

const showsQuery = useAPIQuery<HomeShowsResponse>({
  queryKey: [ShowQueryKey.HomeShows],
  queryFn: async () => {
    const [latest, random, sections] = await Promise.all([
      showService.list({ sort: '-created_at', page: { size: LATEST_SHOWS_MAX_COLS } }),
      showService.list({ filter: { exclude_watch_status: WATCHED_SHOW_STATUSES }, sort: 'random', page: { size: 20 } }),
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
    randomShows: [],
    categorySections: [],
    categoryShows: {},
  },
});

/** Separate from the other lists so playback can refetch it without reshuffling the random picks. */
const continueWatchingQuery = useAPIQuery<Show[]>({
  queryKey: [ShowQueryKey.ContinueWatchingShows],
  queryFn: async () => {
    const response = await showService.list({
      filter: { has_watch_progress: '1' },
      sort: '-last_watched_at',
      page: { size: 20 },
    });

    return response.data;
  },
});

const sections = computed<HomepageSection[]>(() => [
  ...homepageSections.map((section) => ({
    ...section,
    title: t(section.title),
    subtitle: t(section.subtitle),
    emptyText: section.emptyText ? t(section.emptyText) : undefined,
  })),
  ...(showsQuery.data.value?.categorySections ?? []),
]);

const showMap = computed<Record<string, Show[]>>(() => ({
  continueToWatchShows: continueWatchingQuery.data.value ?? [],
  randomShows: showsQuery.data.value?.randomShows ?? [],
  ...showsQuery.data.value?.categoryShows,
}));

/** Refetches of the continue watching list keep its cards visible, so only its first load counts. */
const isLoading = computed<boolean>(
  () => settingStore.isLoading || showsQuery.isFetching.value || continueWatchingQuery.isLoading.value,
);

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
      selectedShowId.value = selectedBannerShow.value.id;
    }
  },
);
</script>

<template>
  <page-background
    :background-style="{
      background: [
        'linear-gradient(180deg,',
        `rgb(var(--v-theme-background)) ${HOME_BANNER_HEIGHT},`,
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
    :style="{ marginTop: '-70px', height: HOME_BANNER_HEIGHT }"
    :video-src="bannerVideo"
  >
    <latest-shows-panel
      :loading="isLoading"
      :selected-show="selectedBannerShow"
      :shows="latestBannerShows"
      @click:show="isShowDrawerVisible = true"
      @hover:show="(isHovered: boolean) => (isPointerOverBannerCard = isHovered)"
      @update:selected-show="
        (show: Show | null) =>
          (selectedBannerShow = showsQuery.data.value?.latestShows.find((s: Show) => s.id === show?.id) ?? null)
      "
    />
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
              :play-on-click="section.playOnClick"
              :shows="showMap[section.dataKey] ?? []"
              :starting-show-id="section.playOnClick ? startingShowId : null"
              :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
              drag-class="pl-12 pr-12"
              @click:show="isShowDrawerVisible = true"
              @play:show="playShow"
              @playing-video="onPlayingVideoUpdate"
              @update:selected-show="(show: Show | null | undefined) => (selectedShowId = show?.id ?? null)"
              v-else
            />

            <div class="d-flex" v-if="!isLoading && (showMap[section.dataKey]?.length ?? 0) === 0">
              <v-alert class="flex-0-0" type="info">
                <p class="text-no-wrap">{{ section.emptyText ?? t('home.noShowsInCategory') }}</p>
              </v-alert>
            </div>
          </titled-section>
        </component>
      </v-col>
    </v-row>
  </page-container>

  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" v-model:show-id="selectedShowId" />
</template>
