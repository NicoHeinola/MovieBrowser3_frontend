<script setup lang="ts">
import type { ShowEntriesFormData, ShowEntryFormData } from './ShowEntriesFormData';
import type { IDragEvent } from '@vue-dnd-kit/core';
import { makeDroppable } from '@vue-dnd-kit/core';
import { ref, useTemplateRef } from 'vue';
import SortableItem from '@/components/common/sortable-item';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import ShowEntryExpansionPanel from './ShowEntryExpansionPanel.vue';

const show = defineModel<ShowEntriesFormData>('show', { required: true });

const zoneRef = useTemplateRef<HTMLElement>('zone');
const expandedEntries = ref<ShowEntryFormData[]>([]);

const { confirm } = useConfirmDialog();

const unsavedEntryRenderKey = Symbol('unsavedEntryRenderKey');

/**
 * Keep persisted `sort_order` aligned with current visual list order.
 *
 * @returns Nothing.
 */
const syncEntrySortOrder = (): void => {
  for (const [index, entry] of (show.value.entries ?? []).entries()) {
    entry.sort_order = index;
  }
};

const getEntryRenderKey = (entry: ShowEntryFormData): string | symbol => {
  if (entry.id != null) {
    return `entry-${entry.id}`;
  }

  const localEntry = entry as ShowEntryFormData & { [unsavedEntryRenderKey]?: symbol };

  localEntry[unsavedEntryRenderKey] ??= Symbol('entry');

  return localEntry[unsavedEntryRenderKey];
};

const setEntryExpanded = (entry: ShowEntryFormData, isExpanded: boolean): void => {
  if (isExpanded) {
    expandedEntries.value = [...new Set([...expandedEntries.value, entry])];
    return;
  }

  expandedEntries.value = expandedEntries.value.filter((expandedEntry) => expandedEntry !== entry);
};

const removeEntry = async (index: number): Promise<void> => {
  if ((show.value.entries?.length ?? 0) <= 1) {
    return;
  }

  const entryName = show.value.entries?.[index]?.name;
  const isConfirmed = await confirm({
    message: `Are you sure you want to remove "${entryName}"?`,
    confirmColor: 'error',
    confirmText: 'Remove',
  });

  if (!isConfirmed) {
    return;
  }

  const removedEntry = show.value.entries?.[index];
  show.value.entries?.splice(index, 1);

  if (removedEntry) {
    setEntryExpanded(removedEntry, false);
  }

  syncEntrySortOrder();
};

const addEntry = (): void => {
  const entries = (show.value.entries ??= []);

  const nextEntry: ShowEntryFormData = {
    type: ShowEntryType.Season,
    name: `Untitled`,
    sort_order: entries.length,
    episodes: [],
  };

  entries.push(nextEntry);
  setEntryExpanded(nextEntry, true);
};

makeDroppable(
  zoneRef,
  {
    groups: ['show-entry'],
    events: {
      onDrop(e: IDragEvent) {
        const suggestedSort = e.helpers.suggestSort('vertical');
        if (suggestedSort == null) {
          return;
        }

        show.value.entries = suggestedSort.sourceItems as ShowEntryFormData[];
        syncEntrySortOrder();
      },
    },
  },
  () => show.value?.entries ?? [],
);
</script>

<template>
  <v-row gap="0">
    <v-col cols="12">
      <div class="d-flex ga-2 flex-column overflow-scroll justify-start" ref="zone">
        <transition-group name="task">
          <sortable-item
            v-for="(entry, i) in show.entries"
            :drag-options="{ dragHandle: '.handle', groups: ['show-entry'] }"
            :drag-payload="() => [i, show.entries!]"
            class="d-flex ga-2"
            :key="getEntryRenderKey(entry)"
          >
            <show-entry-expansion-panel
              v-model:entry="show.entries![i]"
              :expanded="expandedEntries.includes(entry)"
              @update:expanded="setEntryExpanded(entry, $event)"
            />
            <v-btn
              :disabled="(show.entries?.length ?? 0) === 1"
              color="error"
              icon="mdi-trash-can"
              size="x-small"
              @click.stop="removeEntry(i)"
            />
          </sortable-item>
        </transition-group>
      </div>
    </v-col>
    <v-col cols="12">
      <v-btn size="small" variant="text" @click="addEntry"> Add another entry </v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
.task-move {
  transition: transform 0.25s;
}
</style>
