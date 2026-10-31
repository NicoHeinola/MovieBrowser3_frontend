<script setup lang="ts">
import type { SortOption } from '@/components/common/sort-menu';

import { SortMenu } from '@/components/common/sort-menu';

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    /** Shows the filter button with this badge count. Leave it out for a search without filters. */
    activeFilterCount?: number;
    /** Shows the sort menu. Leave it out for a search without sorting. */
    sortOptions?: SortOption[];
  }>(),
  {
    placeholder: 'Search...',
    activeFilterCount: undefined,
    sortOptions: undefined,
  },
);

const search = defineModel<string>('search', { required: true });
const sort = defineModel<string>('sort', { default: '' });

const emit = defineEmits<{
  'click:filters': [];
}>();
</script>

<template>
  <v-row justify="center">
    <v-col class="d-flex ga-2 align-center" cols="12" lg="8" md="10" xl="6">
      <v-text-field
        v-model="search"
        :placeholder="props.placeholder"
        prepend-inner-icon="mdi-magnify"
        rounded="xl"
        variant="solo-filled"
        autofocus
        clearable
      />
      <sort-menu v-model="sort" :options="props.sortOptions" v-if="props.sortOptions" />
      <v-badge
        :content="props.activeFilterCount"
        :model-value="props.activeFilterCount > 0"
        color="secondary"
        bordered
        v-if="props.activeFilterCount !== undefined"
      >
        <v-btn
          :variant="props.activeFilterCount > 0 ? 'flat' : 'tonal'"
          icon="mdi-tune-variant"
          size="small"
          @click="emit('click:filters')"
          v-tooltip:bottom="'Filters'"
        />
      </v-badge>
    </v-col>
  </v-row>
</template>
