<script setup lang="ts">
import type { StyleValue } from 'vue';
import { SHOW_GRID_CARD_SIZE } from '@/utils/show/showGridCardSize';

const props = defineProps<{
  /** How many cards to stand in for, normally the page size. */
  count: number;
  /** Size of the grid that replaces the skeleton, so the cards appear where the skeleton was. */
  gridStyle: StyleValue;
}>();
</script>

<template>
  <v-row justify="center">
    <v-col class="d-flex justify-center" cols="12">
      <div :style="props.gridStyle" class="d-flex justify-center flex-0-0">
        <v-row class="w-100 ga-8">
          <v-col v-for="i in props.count" cols="auto" :key="i">
            <v-skeleton-loader :height="SHOW_GRID_CARD_SIZE.height" :width="SHOW_GRID_CARD_SIZE.width" type="ossein" />
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>
