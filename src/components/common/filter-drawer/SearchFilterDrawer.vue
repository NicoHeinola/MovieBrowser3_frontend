<script setup lang="ts" generic="TFilters extends Record<keyof TFilters, SearchFilterValue>">
import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';
import type { RangeFilterValue } from '@/composables/search/RangeFilterValue';
import type { SearchFilterDefinition } from '@/composables/search/SearchFilterDefinition';
import type { SearchFilterValue } from '@/composables/search/SearchFilterValue';

import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { HighlightText } from '@/components/common/highlight-text';
import { SearchFilterType } from '@/enums/search/SearchFilterType';
import FilterDrawer from './FilterDrawer.vue';
import FilterDrawerSection from './FilterDrawerSection.vue';
import SearchFilterChips from './SearchFilterChips.vue';
import SearchFilterRange from './SearchFilterRange.vue';

const props = defineProps<{
  definitions: SearchFilterDefinition<keyof TFilters & string>[];
  activeFilterCount: number;
  totalResults: number;
  isLoading: boolean;
}>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const filters = defineModel<TFilters>('filters', { required: true });

const emit = defineEmits<{
  clear: [];
}>();

const { t } = useI18n();

/** The newest filters, ahead of the model until the parent passes a change back down. */
let latestFilters = filters.value;

watch(
  filters,
  (currentFilters) => {
    latestFilters = currentFilters;
  },
  { flush: 'sync' },
);

/**
 * Replaces the filters with a copy that has one filter changed. It builds on the newest filters, because several filters
 * can change in one tick, and building on the model would undo all but the last.
 * @param key - The filter's key.
 * @param value - The filter's new value.
 * @returns void
 */
const setFilter = (key: keyof TFilters, value: SearchFilterValue): void => {
  latestFilters = { ...latestFilters, [key]: value };
  filters.value = latestFilters;
};
</script>

<template>
  <filter-drawer
    v-model:is-shown="isShown"
    :active-filter-count="props.activeFilterCount"
    :is-loading="props.isLoading"
    :total-results="props.totalResults"
    @clear="emit('clear')"
  >
    <filter-drawer-section v-for="definition in props.definitions" :title="t(definition.title)" :key="definition.key">
      <template #subtitle v-if="definition.hint">
        <i18n-t :keypath="definition.hint.keypath" tag="span">
          <template #[definition.hint.include]>
            <highlight-text color="secondary">{{ t(`filter.${definition.hint.include}`) }}</highlight-text>
          </template>
          <template #[definition.hint.exclude]>
            <highlight-text color="error">{{ t(`filter.${definition.hint.exclude}`) }}</highlight-text>
          </template>
        </i18n-t>
      </template>

      <search-filter-chips
        :definition="definition"
        :model-value="filters[definition.key] as ChipsFilterValue"
        @update:model-value="setFilter(definition.key, $event)"
        v-if="definition.type === SearchFilterType.Chips"
      />
      <search-filter-range
        :definition="definition"
        :model-value="filters[definition.key] as RangeFilterValue"
        @update:model-value="setFilter(definition.key, $event)"
        v-else-if="definition.type === SearchFilterType.Range"
      />
      <v-col cols="12" v-else>
        <v-switch
          :label="t(definition.label)"
          :model-value="filters[definition.key]"
          @update:model-value="setFilter(definition.key, $event === true)"
        />
      </v-col>
    </filter-drawer-section>
  </filter-drawer>
</template>
