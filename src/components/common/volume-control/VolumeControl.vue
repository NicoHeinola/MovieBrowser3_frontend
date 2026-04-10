<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const muted = defineModel<boolean>('muted', {
  default: true,
});

const volume = defineModel<number>('volume', {
  default: 20,
});

const isExpanded = ref<boolean>(false);
const lastAudibleVolume = ref<number>(volume.value > 0 ? volume.value : 20);

const volumeIcon = computed<string>(() => {
  if (muted.value || volume.value === 0) return 'mdi-volume-off';
  if (volume.value < 50) return 'mdi-volume-low';
  return 'mdi-volume-high';
});

const expand = () => {
  isExpanded.value = true;
};

const collapse = () => {
  isExpanded.value = false;
};

const toggleMuted = () => {
  if (muted.value) {
    muted.value = false;

    if (volume.value === 0) {
      volume.value = lastAudibleVolume.value;
    }

    return;
  }

  muted.value = true;
};

watch(
  () => volume.value,
  (nextVolume) => {
    if (nextVolume > 0) {
      lastAudibleVolume.value = nextVolume;
      muted.value = false;
      return;
    }

    muted.value = true;
  },
);
</script>

<template>
  <div class="d-inline-flex" data-testid="volume-control" @mouseenter="expand" @mouseleave="collapse">
    <v-sheet class="d-inline-flex align-center overflow-hidden border px-2 py-1" rounded="pill">
      <v-btn :icon="volumeIcon" size="small" variant="text" @click="toggleMuted" />

      <v-expand-x-transition>
        <div class="d-flex align-center ms-1 overflow-hidden" style="width: 116px" v-if="isExpanded">
          <v-slider v-model="volume" max="100" min="0" step="1" thumb-size="12" hide-details />
        </div>
      </v-expand-x-transition>
    </v-sheet>
  </div>
</template>
