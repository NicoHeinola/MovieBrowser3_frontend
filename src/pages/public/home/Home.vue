<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';

import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { TitledSection } from '@/components/common/titled-section';
import { SelectedShowDrawer } from '@/components/features/show/selected-show-drawer';
import { ShowBanner } from '@/components/features/show/show-banner';
import { ShowCarousel } from '@/components/features/show/show-carousel';
import { ShowGrid } from '@/components/features/show/show-grid';

const continueToWatchShows = ref<Show[]>([
  {
    id: 1,
    banner_url: 'https://images6.alphacoders.com/128/1280527.jpg',
    card_image_url: 'https://images6.alphacoders.com/128/1280527.jpg',
    preview_url: 'https://www.youtube.com/watch?v=QczGoCmX-pI',
    titles: [
      {
        title: 'Cyberpunk Edgerunners',
        is_primary: true,
      },
    ],
  },
  {
    id: 2,
    banner_url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2023/01/nier-automata-anime-poster.jpg',
    card_image_url: 'https://static0.srcdn.com/wordpress/wp-content/uploads/2023/01/nier-automata-anime-poster.jpg',
    preview_url: 'https://youtu.be/eIMZYgb85xg?si=BfqVQ3UBY4w6WAEP',
    titles: [
      {
        title: 'Arcane',
        is_primary: true,
      },
    ],
  },
  {
    id: 3,
    banner_url:
      'https://www.animelehti.fi/wp-content/uploads/2024/08/Netflix-julkaisi-englanniksi-tekstitetyn-trailerin-uudesta-Ranma-12-animesta.png',
    card_image_url: 'https://images6.alphacoders.com/137/thumb-1920-1378928.png',
    preview_url: null,
    titles: [
      {
        title: 'Spider-Man: Into the Spider-Verse Spider-Man: Into the Spider-Verse Spider-Man: Into the Spider-Verse',
        is_primary: true,
      },
      {
        title: 'aweawe',
        is_primary: false,
      },
    ],
  },
  {
    id: 4,
    banner_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    preview_url: 'https://youtu.be/doesnotwork',
    titles: [
      {
        title: 'Oppenheimer',
        is_primary: true,
      },
    ],
  },
  {
    id: 5,
    banner_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    preview_url: 'https://youtu.be/doesnotwork',
    titles: [
      {
        title: 'Oppenheimer',
        is_primary: true,
      },
    ],
  },
  {
    id: 6,
    banner_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    preview_url: 'https://youtu.be/doesnotwork',
    titles: [
      {
        title: 'Oppenheimer',
        is_primary: true,
      },
    ],
  },
  {
    id: 7,
    banner_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    preview_url: 'https://youtu.be/doesnotwork',
    titles: [
      {
        title: 'Oppenheimer',
        is_primary: true,
      },
    ],
  },
  {
    id: 8,
    banner_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    card_image_url: 'https://images2.alphacoders.com/121/thumb-1920-1210724.png',
    preview_url: 'https://youtu.be/doesnotwork',
    titles: [
      {
        title: 'Oppenheimer',
        is_primary: true,
      },
    ],
  },
]);

const getShuffledShows = (shows: Show[]): Show[] => {
  const shuffledShows = [...shows];

  for (let currentIndex = shuffledShows.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
    const currentShow = shuffledShows[currentIndex];

    shuffledShows[currentIndex] = shuffledShows[randomIndex];
    shuffledShows[randomIndex] = currentShow;
  }

  return shuffledShows;
};

const latestShows = ref<Show[]>(getShuffledShows(continueToWatchShows.value));

const isekaiShows = ref<Show[]>(getShuffledShows(continueToWatchShows.value));

const romanceShows = ref<Show[]>(getShuffledShows(continueToWatchShows.value));

const randomShows = ref<Show[]>(getShuffledShows(continueToWatchShows.value));

const selectedBannerShow = ref<Show | null>(null); // Null on purpose
const selectedShow = ref<Show | null>(selectedBannerShow.value);
const isShowDrawerVisible = ref<boolean>(false);

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
</script>

<template>
  <show-banner
    :disable-video-playback="isShowDrawerVisible"
    :selected-show="selectedBannerShow"
    style="margin-top: -70px; height: 73vh"
  >
    <v-row align="center" style="max-width: 90%">
      <v-col>
        <v-sheet
          border="sm"
          class="position-relative"
          rounded="xl"
          style="background: rgb(var(--v-theme-surface), 0.5); backdrop-filter: blur(10px) brightness(120%)"
        >
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
  <v-container class="pl-12 pr-0" fluid>
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
          class="pr-12"
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
          class="pr-12"
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
          class="pr-12"
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
          class="pr-12"
          @click:show="isShowDrawerVisible = true"
        />
      </titled-section>
    </v-row>
  </v-container>
</template>
