<script setup lang="ts">
import type { ShowEntriesFormData, ShowEntryFormData } from './ShowEntriesFormData';
import type { IDragEvent } from '@vue-dnd-kit/core';
import { makeDroppable } from '@vue-dnd-kit/core';
import { useTemplateRef } from 'vue';
import SortableItem from '@/components/common/sortable-item';

const show = defineModel<ShowEntriesFormData>('show', { required: true });

const zoneRef = useTemplateRef<HTMLElement>('zone');

makeDroppable(
  zoneRef,
  {
    events: {
      onDrop(e: IDragEvent) {
        const suggestedSort = e.helpers.suggestSort('vertical');
        if (suggestedSort == null) {
          return;
        }

        show.value.entries = suggestedSort.sourceItems as ShowEntryFormData[];

        // Update sort values to match new order
        for (const [index, entry] of show.value.entries.entries()) {
          entry.sort_order = index;
        }
      },
    },
  },
  () => show.value?.entries ?? [],
);
</script>

<template>
  <div class="d-flex ga-2 flex-column overflow-scroll justify-start" ref="zone">
    <transition-group name="task">
      <sortable-item
        v-for="(entry, i) in show.entries"
        :drag-options="{ dragHandle: '.handle' }"
        :drag-payload="() => [i, show.entries!]"
        :key="entry.id!"
      >
        <v-btn class="max-width-button justify-start w-100" @click.stop>
          <template #prepend>
            <v-icon class="handle cursor-grab" icon="mdi-drag-vertical" />
          </template>
          <span class="text-truncate d-flex text-start flex-column">
            {{ entry.name }}
          </span>
          <v-spacer />
          <template #append>
            <p class="text-no-wrap">{{ entry.episodes?.length ?? 0 }} Episodes</p>
          </template>
        </v-btn>
      </sortable-item>
    </transition-group>
  </div>
</template>

<style scoped>
.task-move {
  transition: transform 0.25s;
}
</style>
