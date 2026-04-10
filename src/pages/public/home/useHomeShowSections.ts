import type { Show } from '@/interfaces/api/models/Show';

import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { homeMockShows } from './homeMockShows';

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

export const useHomeShowSections = () => {
  const continueToWatchShows = ref<Show[]>(homeMockShows);
  const latestShows = ref<Show[]>(getShuffledShows(continueToWatchShows.value));
  const isekaiShows = ref<Show[]>(getShuffledShows(continueToWatchShows.value));
  const romanceShows = ref<Show[]>(getShuffledShows(continueToWatchShows.value));
  const randomShows = ref<Show[]>(getShuffledShows(continueToWatchShows.value));

  const selectedBannerShow = ref<Show | null>(null);
  const selectedShow = ref<Show | null>(selectedBannerShow.value);
  const isShowDrawerVisible = ref(false);

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

  return {
    continueToWatchShows,
    continueWatchingCols,
    isShowDrawerVisible,
    isekaiShows,
    latestShows,
    randomShows,
    romanceShows,
    selectedBannerShow,
    selectedShow,
  };
};
