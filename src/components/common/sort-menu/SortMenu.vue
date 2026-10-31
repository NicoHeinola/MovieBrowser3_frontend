<script setup lang="ts">
import type { SortOption } from './sortOption';

import { computed } from 'vue';

const props = defineProps<{
  options: SortOption[];
}>();

const sort = defineModel<string>({ required: true });

const selectedOption = computed<SortOption | undefined>(() =>
  props.options.find((option) => option.value === sort.value),
);
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        :icon="selectedOption?.icon ?? 'mdi-sort'"
        size="small"
        v-tooltip:bottom="`Sort: ${selectedOption?.title ?? 'Default'}`"
      />
    </template>
    <v-list>
      <v-list-item
        v-for="option in props.options"
        :active="sort === option.value"
        :prepend-icon="option.icon"
        :title="option.title"
        @click="sort = option.value"
        :key="option.value"
      />
    </v-list>
  </v-menu>
</template>
