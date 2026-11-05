<script setup lang="ts">
import type { ShowEntriesFormData } from './ShowEntriesFormData';
import type { ShowEntryFormData } from './ShowEntryFormData';
import { makeDroppable } from '@vue-dnd-kit/core';
import { ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormItemList } from '@/components/common/form-item-list';
import { SortableItem } from '@/components/common/sortable-item';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import ShowEntryExpansionPanel from './ShowEntryExpansionPanel.vue';

const show = defineModel<ShowEntriesFormData>('show', { required: true });

const zoneRef = useTemplateRef<HTMLElement>('zone');
const expandedEntries = ref<ShowEntryFormData[]>([]);

const { confirm } = useConfirmDialog();
const { t } = useI18n();

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
    message: t('show.removeEntryConfirm', { name: entryName }),
    confirmColor: 'error',
    confirmText: t('common.remove'),
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
  const seasonCount = entries.filter((entry) => entry.type === ShowEntryType.Season).length;

  const nextEntry: ShowEntryFormData = {
    type: ShowEntryType.Season,
    name: `Season ${seasonCount + 1}`,
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
  },
  () => show.value?.entries ?? [],
);
</script>

<template>
  <form-item-list :has-items="(show.entries?.length ?? 0) > 0">
    <div class="d-flex ga-2 flex-column overflow-auto justify-start" ref="zone">
      <transition-group name="task">
        <sortable-item
          v-for="(entry, i) in show.entries"
          :drag-options="{ dragHandle: '.handle', groups: ['show-entry'] }"
          :drag-payload="() => [i, show.entries!]"
          class="d-flex ga-2"
          @sorted="syncEntrySortOrder"
          :key="getEntryRenderKey(entry)"
        >
          <show-entry-expansion-panel
            v-model:entry="show.entries![i]"
            :expanded="expandedEntries.includes(entry)"
            style="min-width: 0"
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

    <template #actions>
      <v-btn size="small" variant="text" @click="addEntry"> {{ t('show.addEntry') }} </v-btn>
    </template>
  </form-item-list>
</template>

<style scoped>
.task-move {
  transition: transform 0.25s;
}
</style>
