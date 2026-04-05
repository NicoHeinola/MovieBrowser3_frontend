<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';

import ShowCard from '@/components/features/show/show-card/ShowCard.vue';

const props = withDefaults(
  defineProps<{
    shows: Show[];
    cardWidth?: string | number;
    cardHeight?: string | number;
    gap?: string | number;
  }>(),
  {
    cardWidth: '300px',
    cardHeight: '200px',
    gap: 20,
  },
);

const emit = defineEmits<{
  (e: 'click:show', value: Show | null): void;
}>();

const selectedShow = defineModel<Show | null>('selectedShow');
</script>

<template>
  <div class="shows-container d-flex overflow-auto w-100" style="scrollbar-width: 0 !important; scrollbar-color: red">
    <show-card
      v-for="show in [...props.shows, props.shows[0]]"
      :height="cardHeight"
      :show="show"
      :width="cardWidth"
      class="rounded-0"
      @click="emit('click:show', show)"
      @mouseenter="selectedShow = show"
      :key="show.id"
    />
  </div>
</template>

<style lang="scss" scoped>
.shows-container {
  scrollbar-width: none;
}
</style>
