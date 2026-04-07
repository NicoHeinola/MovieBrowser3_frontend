<script setup lang="ts">
import { TitledSection } from '@/components/common/titled-section';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowBanner } from '@/components/features/show/show-banner';
import { ShowCarousel } from '@/components/features/show/show-carousel';
import { ShowGrid } from '@/components/features/show/show-grid';
import { useHomeShowSections } from './useHomeShowSections';

const {
  continueToWatchShows,
  continueWatchingCols,
  isShowDrawerVisible,
  isekaiShows,
  latestShows,
  randomShows,
  romanceShows,
  selectedBannerShow,
  selectedShow,
} = useHomeShowSections();
</script>

<template>
  <show-banner
    :disable-video-playback="isShowDrawerVisible"
    :selected-show="selectedBannerShow"
    style="margin-top: -70px; height: 73vh"
  >
    <v-row align="center" style="max-width: 90%">
      <v-col>
        <v-sheet border="sm" class="position-relative glass-panel" rounded="xl">
          <v-container class="pa-8">
            <titled-section icon="mdi-play-circle" icon-color="warning" title="Continue Watching"> </titled-section>
            <show-grid
              v-model:selected-show="selectedBannerShow"
              :cols="continueWatchingCols"
              :shows="continueToWatchShows"
              @click:show="isShowDrawerVisible = true"
            />
          </v-container>
        </v-sheet>
      </v-col>
    </v-row>
  </show-banner>
  <selected-show-drawer v-model:is-shown="isShowDrawerVisible" :show="selectedShow" />
  <v-container class="pl-12 pr-0 overflow-visible" fluid>
    <v-row gap="48">
      <titled-section
        icon="mdi-clock-outline"
        icon-color="warning"
        subtitle="Fresh arrivals and recently updated picks."
        title="Latest"
      >
        <show-carousel
          v-model:selected-show="selectedShow"
          :shows="latestShows"
          :style="{ left: '-48px', width: 'calc(100% + 48px)', position: 'relative' }"
          drag-class="pl-12 pr-12"
          @click:show="isShowDrawerVisible = true"
        />
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
      </titled-section>
    </v-row>
  </v-container>
</template>
