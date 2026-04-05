<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import ShowCard from '@/components/features/show/show-card/ShowCard.vue';

export interface ContinueWatchingListProps {
  shows: Show[];
}

const props = defineProps<ContinueWatchingListProps>();
const emit = defineEmits<{
  (e: 'update:selectedShow', show: Show | null): void;
}>();

const { xxl, xlAndUp, lgAndUp } = useDisplay();

const bannerCardContainerWidth = computed(() => {
  const basePadding = 40;
  const baseCardSize = 300;

  if (xxl.value) return (basePadding + baseCardSize) * 5 - 30 + 'px';
  if (xlAndUp.value) return (basePadding + baseCardSize) * 4 - 30 + 'px';
  if (lgAndUp.value) return (basePadding + baseCardSize) * 3 - 30 + 'px';
  return '310px';
});
</script>

<template>
  <div :style="{ maxWidth: `min(${bannerCardContainerWidth}, 90%)` }">
    <h1>Continue Watching</h1>
    <div class="d-flex align-center ga-10 w-100 pa-1 overflow-x-scroll">
      <show-card
        v-for="show in props.shows"
        :show="show"
        height="400px"
        min-width="300px"
        width="300px"
        @click="console.log('Watching show')"
        @mouseenter="emit('update:selectedShow', show)"
        :key="show.id"
      />
    </div>
  </div>
</template>
