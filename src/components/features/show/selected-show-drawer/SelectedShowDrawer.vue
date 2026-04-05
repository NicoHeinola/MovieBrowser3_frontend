<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';

import { getPrimaryShowTitle } from '@/utils/show/getPrimaryShowTitle';

export interface SelectedShowDrawerProps {
  show: Show | null;
}

const props = defineProps<SelectedShowDrawerProps>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const close = () => {
  isShown.value = false;
};

const displayTitle = computed(() => getPrimaryShowTitle(props.show, 'Selected show'));
</script>

<template>
  <v-navigation-drawer
    v-model="isShown"
    class="selected-show-drawer"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    width="500"
    temporary
  >
    <v-img :src="props.show?.card_image_url" class="w-100" height="50%" cover @click="() => {}">
      <div class="image-shadow position-absolute w-100 h-100" icon="mdi-close">
        <div class="d-flex align-end h-100 pa-6">
          <h2>{{ displayTitle }}</h2>
        </div>
      </div>
      <v-btn
        class="position-absolute w-100 h-100 rounded-0"
        style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
        variant="text"
        icon
      >
        <v-icon size="64">mdi-play-circle-outline</v-icon>
        <v-tooltip activator="parent" location="top"> Continue watching </v-tooltip>
      </v-btn>
      <v-btn class="position-absolute right-0 top-0 ma-4" icon="mdi-close" variant="text" @click="close" />
    </v-img>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
.image-shadow {
  background: linear-gradient(to top, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface), 0.4) 100%);
}
</style>
