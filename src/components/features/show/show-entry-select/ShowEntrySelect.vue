<script setup lang="ts">
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { ShowEntryTypeChip } from '@/components/features/show/show-entry-type-chip';

const props = defineProps<{
  entries?: ShowEntry[] | null;
  label?: string;
}>();

const selectedEntry = defineModel<ShowEntry | null>({
  default: null,
});

const { t } = useI18n();

const availableEntries = computed<ShowEntry[]>(() => props.entries ?? []);
const selectLabel = computed<string>(() => props.label ?? t('showEntry.select.label'));

watch(availableEntries, (nextEntries) => {
  if (!selectedEntry.value) {
    return;
  }

  const hasSelectedEntry = nextEntries.some((entry) => entry.id === selectedEntry.value?.id);

  if (!hasSelectedEntry) {
    selectedEntry.value = null;
  }
});
</script>

<template>
  <v-select
    v-model="selectedEntry"
    :disabled="availableEntries.length === 0"
    :items="availableEntries"
    :label="selectLabel"
    item-title="name"
    item-value="id"
    return-object
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="item.name">
        <template #append>
          <show-entry-type-chip :type="item.type" />
        </template>
      </v-list-item>
    </template>

    <template #append-inner v-if="selectedEntry">
      <show-entry-type-chip :type="selectedEntry?.type" color="primary" />
    </template>
  </v-select>
</template>
