<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import ShowCard from '@/components/features/show/show-card/ShowCard.vue';

export interface ShowGridProps {
  shows: Show[];
  rows?: number;
  cols?: number;
}

const props = withDefaults(defineProps<ShowGridProps>(), {
  rows: 1,
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
  const baseCardSize = 300;

  if (effectiveCols.value > 1) {
    return (basePadding + baseCardSize) * effectiveCols.value - 30 + 'px';
  }
  return '310px';
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
