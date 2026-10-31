<script setup lang="ts">
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import { useResizeObserver, useScroll } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { DragScrollContainer } from '@/components/common/drag-scroll-container';
import { SectionLabel } from '@/components/common/section-label';
import { getWatchStatusColor } from '@/utils/show/getWatchStatusColor';
import { getWatchStatusIcon } from '@/utils/show/getWatchStatusIcon';

const props = defineProps<{
  entries: ShowEntry[];
  /** The entry the user was last watching, marked so it stands out. */
  watchingEntryId?: number | null;
}>();

const selectedEntry = defineModel<ShowEntry | null>({
  default: null,
});

const container = ref<InstanceType<typeof DragScrollContainer> | null>(null);

const { t } = useI18n();

/** The container's scrolling element, which the arrows track and drive. */
const rail = computed<HTMLElement | null>(() => container.value?.el ?? null);

const { arrivedState, measure } = useScroll(rail);

/** Whether the cards overflow the rail, so the arrows are needed. */
const isOverflowing = computed<boolean>(() => !(arrivedState.left && arrivedState.right));

/**
 * Resolves a card's color: primary when selected, secondary when it is the entry being watched.
 * @param entry - The card's entry.
 * @returns The Vuetify color, or undefined for the default outline.
 */
const getCardColor = (entry: ShowEntry): string | undefined => {
  if (entry.id === selectedEntry.value?.id) return 'primary';
  if (entry.id === props.watchingEntryId) return 'secondary';
  return undefined;
};

/**
 * Selects the entry, or clears the selection when it is already selected.
 * @param entry - The clicked entry.
 */
const toggle = (entry: ShowEntry): void => {
  selectedEntry.value = selectedEntry.value?.id === entry.id ? null : entry;
};

/**
 * Scrolls the rail by most of its visible width.
 * @param direction - `-1` to scroll left, `1` to scroll right.
 */
const scrollBy = (direction: -1 | 1): void => {
  rail.value?.scrollBy({ behavior: 'smooth', left: direction * rail.value.clientWidth * 0.8 });
};

watch(() => props.entries, measure, { flush: 'post' });

useResizeObserver(rail, measure);
</script>

<template>
  <div class="d-flex align-center ga-1">
    <v-btn
      :disabled="arrivedState.left"
      icon="mdi-chevron-left"
      size="small"
      variant="text"
      @click="scrollBy(-1)"
      v-if="isOverflowing"
    />
    <div class="flex-1-1 overflow-hidden" style="min-width: 0">
      <drag-scroll-container class="d-flex ga-2 overflow-x-auto" ref="container">
        <v-card
          v-for="entry in entries"
          :color="getCardColor(entry)"
          :variant="entry.id === selectedEntry?.id ? 'tonal' : 'outlined'"
          class="flex-shrink-0"
          style="max-width: 240px"
          @click="toggle(entry)"
          :key="entry.id"
        >
          <v-card-text class="d-flex align-center ga-3">
            <v-icon :icon="entry.id === selectedEntry?.id ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'" />
            <section-label
              :subtitle="t(`showEntry.type.${entry.type}`)"
              :title="entry.name"
              class="flex-1-1"
              style="min-width: 0"
              truncate
            />
            <v-icon
              color="secondary"
              icon="mdi-history"
              size="small"
              title="Last watched"
              v-if="entry.id === props.watchingEntryId"
            />
            <v-icon
              :color="getWatchStatusColor(entry.watch_status.status)"
              :icon="getWatchStatusIcon(entry.watch_status.status)"
              size="small"
              v-if="entry.watch_status"
            />
          </v-card-text>
        </v-card>
      </drag-scroll-container>
    </div>
    <v-btn
      :disabled="arrivedState.right"
      icon="mdi-chevron-right"
      size="small"
      variant="text"
      @click="scrollBy(1)"
      v-if="isOverflowing"
    />
  </div>
</template>
