<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const muted = defineModel<boolean>('muted', {
  default: true,
});

const volume = defineModel<number>('volume', {
  default: 20,
});

const isExpanded = ref(false);
const lastAudibleVolume = ref(volume.value > 0 ? volume.value : 20);

const normalizedVolume = computed({
  get: () => Math.min(100, Math.max(0, volume.value)),
  set: (nextVolume: number) => {
    const clampedVolume = Math.min(100, Math.max(0, Number(nextVolume)));
    volume.value = clampedVolume;

    if (clampedVolume > 0) {
      lastAudibleVolume.value = clampedVolume;
      muted.value = false;
      return;
    }

    muted.value = true;
  },
});

const volumeIcon = computed(() => {
  if (muted.value || normalizedVolume.value === 0) return 'mdi-volume-off';
  if (normalizedVolume.value < 50) return 'mdi-volume-low';
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

    if (normalizedVolume.value === 0) {
      normalizedVolume.value = lastAudibleVolume.value;
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
    }
  },
);
</script>

<template>
  <div class="d-inline-flex" data-testid="volume-control" @mouseenter="expand" @mouseleave="collapse">
    <v-sheet class="d-inline-flex align-center overflow-hidden border px-2 py-1" rounded="pill">
      <v-btn :icon="volumeIcon" size="small" variant="text" @click="toggleMuted" />

      <v-expand-x-transition>
        <div class="d-flex align-center ms-1 overflow-hidden" style="width: 116px" v-if="isExpanded">
          <v-slider v-model="normalizedVolume" max="100" min="0" step="1" thumb-size="12" hide-details />
        </div>
      </v-expand-x-transition>
    </v-sheet>
  </div>
</template>
