<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import ShowCard from '@/components/features/show/show-card/ShowCard.vue';
import { parseCssNumeric } from '@/utils/css/parseCssNumeric';

export interface ShowGridProps {
  shows: Show[];
  rows?: number;
  cols?: number;
  cardWidth?: string;
  cardHeight?: string;
}

const props = withDefaults(defineProps<ShowGridProps>(), {
  rows: 1,
  cardWidth: '300px',
  cardHeight: '400px',
});

const selectedShow = defineModel<Show | null>('selectedShow');

const { xxl, xlAndUp, lgAndUp } = useDisplay();

const effectiveCols = computed(() => {
  if (props.cols) return props.cols;
  if (xxl.value) return 5;
  if (xlAndUp.value) return 4;
  if (lgAndUp.value) return 3;
  return 1;
});

const showsToShow = computed(() => {
  const count = effectiveCols.value * props.rows;
  return props.shows.slice(0, count);
});

const bannerCardContainerWidth = computed(() => {
  const basePadding = 40;
  // Match cardWidth but as a number for calculation
  const baseCardSize = parseCssNumeric(props.cardWidth, 300);

  if (effectiveCols.value > 1) {
    return (basePadding + baseCardSize) * effectiveCols.value - 30 + 'px';
  }
  return baseCardSize + 10 + 'px';
});
</script>

<template>
  <div :style="{ maxWidth: `min(${bannerCardContainerWidth}, 90%)` }">
    <div
      :style="{
        display: 'grid',
        gridTemplateColumns: `repeat(${effectiveCols}, 1fr)`,
      }"
      class="d-grid ga-10 w-100 pa-1"
    >
      <show-card
        v-for="show in showsToShow"
        :height="cardHeight"
        :min-width="cardWidth"
        :show="show"
        :width="cardWidth"
        @click="console.log('Watching show')"
        @mouseenter="selectedShow = show"
        :key="show.id"
      />
    </div>
  </div>
</template>
