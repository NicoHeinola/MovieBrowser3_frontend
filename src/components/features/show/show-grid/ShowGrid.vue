<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';
import ShowCard from '@/components/features/show/show-card/ShowCard.vue';
import { parseCssNumeric } from '@/utils/css/parseCssNumeric';

const props = withDefaults(
  defineProps<{
    shows: Show[];
    rows?: number;
    cols?: number;
    cardWidth?: string;
    cardHeight?: string;
  }>(),
  {
    rows: 1,
  },
);

const emit = defineEmits<{
  (e: 'click:show', value: Show | null): void;
}>();

const selectedShow = defineModel<Show | null>('selectedShow');

const effectiveCols = computed(() => {
  if (props.shows.length === 0) return 1;
  return Math.min(props.cols ?? 1, props.shows.length);
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
  <div :style="{ maxWidth: `max(${bannerCardContainerWidth}, 90%)` }">
    <div
      :style="{
        display: 'grid',
        gridTemplateColumns: `repeat(${effectiveCols}, 1fr)`,
      }"
      class="d-grid ga-10 w-100 pa-1 overflow-auto align-center"
    >
      <show-card
        v-for="show in showsToShow"
        :height="cardHeight"
        :show="show"
        :width="cardWidth"
        @click="emit('click:show', show)"
        @mouseenter="selectedShow = show"
        :key="show.id"
      />
    </div>
  </div>
</template>
