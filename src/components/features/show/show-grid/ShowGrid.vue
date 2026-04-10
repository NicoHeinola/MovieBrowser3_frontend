<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';
import { ShowCard } from '@/components/features/show/show-card';
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
  return Math.min(props.cols ?? Infinity, props.shows.length);
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
  <div :style="{ maxWidth: `max(${bannerCardContainerWidth}, 100%)` }">
    <v-row class="w-100 ga-8">
      <v-col v-for="show in showsToShow" cols="auto" :key="show.id">
        <show-card
          :height="cardHeight"
          :show="show"
          :width="cardWidth"
          image-to-use="card"
          @click="emit('click:show', show)"
          @mouseenter="selectedShow = show"
        />
      </v-col>
    </v-row>
  </div>
</template>
