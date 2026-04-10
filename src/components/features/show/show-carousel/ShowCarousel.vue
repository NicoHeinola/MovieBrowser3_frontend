<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { ClassValue, StyleValue } from 'vue';
import { DragScrollContainer } from '@/components/common/drag-scroll-container';
import { ShowCard } from '@/components/features/show/show-card';

const props = withDefaults(
  defineProps<{
    shows: Show[];
    cardWidth?: string | number;
    cardHeight?: string | number;
    dragClass?: ClassValue;
    dragStyle?: StyleValue;
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
  <div class="w-100 overflow-visible">
    <drag-scroll-container
      :class="[props.dragClass, 'show-carousel-rail overflow-x-auto overflow-y-hidden d-flex w-100']"
      :style="props.dragStyle"
    >
      <show-card
        v-for="show in [...props.shows, props.shows[0]]"
        :height="cardHeight"
        :show="show"
        :width="cardWidth"
        class="rounded-0"
        image-to-use="card"
        @click.stop="onShowClick(show)"
        :key="show.id"
      />
    </drag-scroll-container>
  </div>
</template>

<style scoped lang="scss">
.show-carousel-rail {
  padding-top: 64px;
  margin-top: -64px;
}
</style>
