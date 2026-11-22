<script setup lang="ts">
import type { SearchFilterType } from '@/enums/search/SearchFilterType';
import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';

import { watch } from 'vue';

const props = defineProps<{
  definition: Extract<SearchFilterDefinition, { type: SearchFilterType.Choice }>;
}>();

/** The picked option's value. */
const value = defineModel<string>({ required: true });

const { options } = props.definition.useOptions();

// A value no option offers (from an old URL or a removed option) would filter with no chip picked, so it falls back
// to the empty value, as chips drop values without a chip
watch(
  options,
  (currentOptions) => {
    if (currentOptions.length > 0 && !currentOptions.some((option) => option.value === value.value)) {
      value.value = props.definition.emptyValue;
    }
  },
  { immediate: true },
);
</script>

<template>
  <!-- Looks like an included filter chip, but picking one unpicks the others. -->
  <v-col class="d-flex flex-wrap ga-2" cols="12">
    <v-chip
      v-for="option in options"
      :append-icon="value === option.value ? 'mdi-check' : undefined"
      :color="value === option.value ? 'secondary' : undefined"
      :prepend-icon="option.icon"
      :text="option.text"
      variant="tonal"
      @click="value = option.value"
      :key="option.value"
    />
  </v-col>
</template>
