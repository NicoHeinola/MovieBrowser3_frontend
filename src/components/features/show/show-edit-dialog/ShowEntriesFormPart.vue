<script setup lang="ts">
import type { ShowEntriesFormData } from './ShowEntriesFormData';
import type { ShowEntryFormData } from './ShowEntryFormData';
import { ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormItemList } from '@/components/common/form-item-list';
import { SortableItem } from '@/components/common/sortable-item';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useSortableItems } from '@/composables/sortable/useSortableItems';
import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { getUnsavedRowKey } from '@/utils/sortable/getUnsavedRowKey';
import ShowEntryExpansionPanel from './ShowEntryExpansionPanel.vue';

const show = defineModel<ShowEntriesFormData>('show', { required: true });

const zoneRef = useTemplateRef<HTMLElement>('zone');
const expandedEntries = ref<ShowEntryFormData[]>([]);

const { confirm } = useConfirmDialog();
const { t } = useI18n();

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

/**
 * Key of an entry in the list, for both Vue and the drag library.
 *
 * @param entry The entry.
 * @returns Its key.
 */
const getEntryRenderKey = (entry: ShowEntryFormData): string => {
  return entry.id == null ? getUnsavedRowKey(entry) : `entry-${entry.id}`;
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

const draftEntries = useSortableItems<ShowEntryFormData>(zoneRef, {
  getItems: () => show.value.entries ?? [],
  getKey: getEntryRenderKey,
  setItems: (entries) => {
    show.value.entries = entries;
    syncEntrySortOrder();
  },
});
</script>

<template>
  <form-item-list :has-items="(show.entries?.length ?? 0) > 0">
    <div class="d-flex ga-2 flex-column overflow-auto justify-start" ref="zone">
      <sortable-item v-for="entry in draftEntries" :item="entry" class="d-flex ga-2" :key="getEntryRenderKey(entry)">
        <show-entry-expansion-panel
          :entry="entry"
          :expanded="expandedEntries.includes(entry)"
          style="min-width: 0"
          @update:expanded="setEntryExpanded(entry, $event)"
        />
        <v-btn
          :disabled="(show.entries?.length ?? 0) === 1"
          color="error"
          icon="mdi-trash-can"
          size="x-small"
          @click.stop="removeEntry(show.entries!.indexOf(entry))"
        />
      </sortable-item>
    </div>

    <template #actions>
      <v-btn size="small" variant="text" @click="addEntry"> {{ t('show.addEntry') }} </v-btn>
    </template>
  </form-item-list>
</template>
