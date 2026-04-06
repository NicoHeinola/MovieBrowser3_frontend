<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';

import DragScrollContainer from '@/components/common/drag-scroll-container/DragScrollContainer.vue';
import ShowCard from '@/components/features/show/show-card/ShowCard.vue';

const props = withDefaults(
  defineProps<{
    shows: Show[];
    cardWidth?: string | number;
    cardHeight?: string | number;
  }>(),
  {
    cardWidth: '300px',
    cardHeight: '200px',
  },
);

const emit = defineEmits<{
  (e: 'click:show', value: Show | null): void;
}>();

const selectedShow = defineModel<Show | null>('selectedShow');

const onShowClick = (show: Show) => {
  selectedShow.value = show;

  emit('click:show', show);
};
</script>

<template>
  <drag-scroll-container class="shows-container d-flex overflow-auto w-100">
    <show-card
      v-for="show in [...props.shows, props.shows[0]]"
      :height="cardHeight"
      :show="show"
      :width="cardWidth"
      class="rounded-0"
      @click.stop="onShowClick(show)"
      :key="show.id"
    />
  </drag-scroll-container>
</template>

<style lang="scss" scoped>
.shows-container {
  width: 100%;
}
</style>
