<script lang="ts" setup>
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';

const props = defineProps<{
  show: Show;
}>();

const primaryTitle = computed(() => {
  const primaryTitleObj = props.show.titles.find((title) => title.is_primary);

  return primaryTitleObj ? primaryTitleObj.title : 'Untitled Show';
});
</script>

<template>
  <v-card class="show-card pa-0 bg-white">
    <v-img :src="props.show.card_image_url" class="h-100 w-100" cover></v-img>
    <p class="position-absolute bottom-0 left-0 px-4 text-truncate w-100" style="cursor: default">
      <v-tooltip activator="parent" location="bottom">
        {{ primaryTitle }}
      </v-tooltip>
      {{ primaryTitle }}
    </p>
  </v-card>
</template>

<style lang="scss" scoped>
.show-card {
  :deep(.v-img) {
    transition:
      transform 0.3s ease-in-out,
      filter 0.3s ease-in-out;
  }

  &:hover {
    :deep(.v-img) {
      cursor: pointer;
      transform: scale(1.05);
      filter: brightness(70%);
    }
  }
}
</style>
