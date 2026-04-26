<script setup lang="ts">
import type { ShowEntriesFormData, ShowEntryFormData } from './ShowEntriesFormData';
import type { ShowEntryType } from '@/enums/show/ShowEntryType';
import type { IDragEvent } from '@vue-dnd-kit/core';
import { DnDProvider, makeDroppable } from '@vue-dnd-kit/core';
import { computed, useTemplateRef } from 'vue';
import SortableItem from '@/components/common/sortable-item';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { getRules } from './showEntriesFormRules';

const show = defineModel<ShowEntriesFormData>('show', { required: true });

const zoneRef = useTemplateRef<HTMLElement>('zone');

makeDroppable(
  zoneRef,
  {
    events: {
      onDrop(e: IDragEvent) {
        const suggestedSort = e.helpers.suggestSort('vertical');
        if (suggestedSort == null) return;
        show.value.entries = suggestedSort.sourceItems as ShowEntryFormData[];
      },
    },
  },
  () => show.value?.entries ?? [],
);
</script>

<template>
  <div class="d-flex flex-column ga-2" ref="zone">
    <transition-group name="task">
      <sortable-item
        v-for="(entry, i) in show.entries"
        :drag-options="{ dragHandle: '.handle' }"
        :drag-payload="() => [i, show.entries!]"
        :key="entry.id!"
      >
        <v-card color="background">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon class="handle cursor-grab" icon="mdi-drag-vertical" />
            <p>{{ entry.name }}</p>
          </v-card-title>
        </v-card>
      </sortable-item>
    </transition-group>
  </div>
</template>

<style scoped>
.task-move {
  transition: transform 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
}
</style>
