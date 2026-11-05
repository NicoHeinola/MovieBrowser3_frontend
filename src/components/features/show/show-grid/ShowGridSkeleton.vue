<script setup lang="ts">
import type { StyleValue } from 'vue';
import { SHOW_GRID_CARD_WIDTH } from '@/utils/show/showGridCardWidth';

const props = defineProps<{
  /** Size of the grid that replaces the skeleton, so the cards appear where the skeleton was. */
  gridStyle: StyleValue;
}>();
</script>

<template>
  <v-row justify="center">
    <v-col class="d-flex justify-center" cols="12">
      <div :style="props.gridStyle" class="d-flex justify-center flex-0-0">
        <v-row class="w-100 ga-8">
          <v-col v-for="i in 16" cols="auto" :key="i">
            <v-skeleton-loader :width="SHOW_GRID_CARD_WIDTH" type="image" />
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>
