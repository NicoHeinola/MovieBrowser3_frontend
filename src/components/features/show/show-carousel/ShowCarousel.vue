<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import ShowCard from '@/components/features/show/show-card/ShowCard.vue';

export interface ShowCarouselProps {
  shows: Show[];
}

const props = defineProps<ShowCarouselProps>();

const selectedShow = defineModel<Show | null>('selectedShow');

const { xxl, xlAndUp, lgAndUp } = useDisplay();

const showsToShow = computed(() => {
  if (xxl.value) return props.shows.slice(0, 5);
  if (xlAndUp.value) return props.shows.slice(0, 4);
  if (lgAndUp.value) return props.shows.slice(0, 3);
  return props.shows.slice(0, 1);
});

const bannerCardContainerWidth = computed(() => {
  const basePadding = 40;
  const baseCardSize = 300;

  if (xxl.value) return (basePadding + baseCardSize) * showsToShow.value.length - 30 + 'px';
  if (xlAndUp.value) return (basePadding + baseCardSize) * showsToShow.value.length - 30 + 'px';
  if (lgAndUp.value) return (basePadding + baseCardSize) * showsToShow.value.length - 30 + 'px';
  return '310px';
});
</script>

<template>
  <div :style="{ maxWidth: `min(${bannerCardContainerWidth}, 90%)` }">
    <div class="d-flex align-center ga-10 w-100 pa-1">
      <show-card
        v-for="show in showsToShow"
        :show="show"
        height="400px"
        min-width="300px"
        width="300px"
        @click="console.log('Watching show')"
        @mouseenter="selectedShow = show"
        :key="show.id"
      />
    </div>
  </div>
</template>
