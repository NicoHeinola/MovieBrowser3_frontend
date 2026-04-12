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
  (e: 'playing-video', value: boolean, show: Show | null): void;
}>();

const selectedShow = defineModel<Show | null>('selectedShow');

const onShowClick = (show: Show) => {
  selectedShow.value = show;

  emit('click:show', show);
};

const onPlayingVideo = (value: boolean, show: Show | null) => {
  emit('playing-video', value, show);
};
</script>

<template>
  <div class="w-100 overflow-visible">
    <v-lazy>
      <drag-scroll-container
        :class="[props.dragClass, 'show-carousel-rail overflow-x-auto overflow-y-hidden d-flex w-100']"
        :style="props.dragStyle"
      >
        <show-card
          v-for="show in props.shows"
          :height="cardHeight"
          :show="show"
          :width="cardWidth"
          image-to-use="card"
          style="border-radius: 0"
          @click.stop="onShowClick(show)"
          @playing-video="(value: boolean) => onPlayingVideo(value, show)"
          :key="show.id"
        />
      </drag-scroll-container>
    </v-lazy>
  </div>
</template>

<style scoped lang="scss">
.show-carousel-rail {
  padding-top: 64px;
  margin-top: -64px;
}
</style>
