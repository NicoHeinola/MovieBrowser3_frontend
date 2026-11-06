<script setup lang="ts">
import type { RangeFilterValue } from '@/composables/search/RangeFilterValue';
import type { SearchFilterDefinition } from '@/composables/search/SearchFilterDefinition';
import type { SearchFilterType } from '@/enums/search/SearchFilterType';

import { useDebounceFn } from '@vueuse/core';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  definition: Extract<SearchFilterDefinition, { type: SearchFilterType.Range }>;
}>();

const range = defineModel<RangeFilterValue>({ required: true });

/** Value of the minimum field, ahead of the model while the user is still typing. */
const minValue = ref<number | null>(range.value.min);
/** Value of the maximum field, ahead of the model while the user is still typing. */
const maxValue = ref<number | null>(range.value.max);

const { t } = useI18n();

/**
 * Applies the typed bounds to the model, after the user stops typing so each keystroke is not a search.
 * @returns void
 */
const applyBounds = useDebounceFn((): void => {
  // Assigning only on a change keeps an untouched range from counting as a new search.
  if (minValue.value !== range.value.min || maxValue.value !== range.value.max) {
    range.value = { min: minValue.value, max: maxValue.value };
  }
}, 400);

// The filters change from outside as well: clearing them or a URL change must update the fields.
watch(range, (current) => {
  minValue.value = current.min;
  maxValue.value = current.max;
});
</script>

<template>
  <v-col cols="6">
    <v-number-input
      v-model="minValue"
      :label="t(props.definition.minLabel)"
      :min="0"
      :precision="0"
      @update:model-value="applyBounds"
    />
  </v-col>
  <v-col cols="6">
    <v-number-input
      v-model="maxValue"
      :label="t(props.definition.maxLabel)"
      :min="0"
      :precision="0"
      @update:model-value="applyBounds"
    />
  </v-col>
</template>
