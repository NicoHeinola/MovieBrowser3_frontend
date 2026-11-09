<script setup lang="ts">
import type { FilterChipState } from '@/components/common/filter-chip';
import type { SearchFilterType } from '@/enums/search/SearchFilterType';
import type { ChipsFilterValue } from '@/interfaces/search/ChipsFilterValue';
import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';

import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { FilterChip } from '@/components/common/filter-chip';
import { getFilterState } from '@/utils/filter/getFilterState';
import { keepKnownFilterValues } from '@/utils/filter/keepKnownFilterValues';
import { toggleFilterValue } from '@/utils/filter/toggleFilterValue';

const props = defineProps<{
  definition: Extract<SearchFilterDefinition, { type: SearchFilterType.Chips }>;
}>();

const selection = defineModel<ChipsFilterValue>({ required: true });

const { t } = useI18n();

const { options, isPending } = props.definition.useOptions();

/**
 * Includes, excludes or stops filtering on a value.
 * @param value - The option value.
 * @param state - The new filter state.
 * @returns void
 */
const setChipState = (value: string, state: FilterChipState): void => {
  selection.value = {
    included: toggleFilterValue(selection.value.included, value, state === 'include'),
    excluded: toggleFilterValue(selection.value.excluded, value, state === 'exclude'),
  };
};

// Options change after a selection is made: tags get deleted, and a URL can name a value that never existed. Such a
// value would keep filtering the results with no chip to turn it off, so it is dropped once the options are known.
watch(
  options,
  (currentOptions) => {
    if (isPending?.value) {
      return;
    }

    const knownSelection = keepKnownFilterValues(
      selection.value,
      currentOptions.map((option) => option.value),
    );

    // Assigning only on a change keeps an untouched selection from counting as a new search.
    if (knownSelection !== selection.value) {
      selection.value = knownSelection;
    }
  },
  { immediate: true },
);
</script>

<template>
  <v-col cols="12" v-if="isPending">
    <v-skeleton-loader class="bg-transparent" type="chip@6" />
  </v-col>
  <v-col class="d-flex flex-wrap ga-2" cols="12" v-else-if="options.length > 0">
    <filter-chip
      v-for="option in options"
      :color="option.color"
      :icon="option.icon"
      :model-value="getFilterState(selection.included, selection.excluded, option.value)"
      :text="option.text"
      @update:model-value="setChipState(option.value, $event)"
      :key="option.value"
    />
  </v-col>
  <v-col cols="12" v-else-if="props.definition.emptyText">
    <p class="text-body-small text-disabled">{{ t(props.definition.emptyText) }}</p>
  </v-col>
</template>
