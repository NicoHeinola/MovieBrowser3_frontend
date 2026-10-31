<script setup lang="ts">
import type { UserSearchFilters } from '@/composables/user/UserSearchFilters';

import { FilterChip } from '@/components/common/filter-chip';
import { FilterDrawer, FilterDrawerSection } from '@/components/common/filter-drawer';

const props = defineProps<{
  activeFilterCount: number;
  totalResults: number;
  isLoading: boolean;
}>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const filters = defineModel<UserSearchFilters>('filters', { required: true });

const emit = defineEmits<{
  clear: [];
}>();
</script>

<template>
  <filter-drawer
    v-model:is-shown="isShown"
    :active-filter-count="props.activeFilterCount"
    :is-loading="props.isLoading"
    :total-results="props.totalResults"
    @clear="emit('clear')"
  >
    <filter-drawer-section title="Role">
      <template #subtitle>
        <span class="text-primary">Include</span> for admins only, <span class="text-error">exclude</span> for the rest.
      </template>
      <v-col class="d-flex flex-wrap ga-3" cols="12">
        <filter-chip
          :model-value="filters.admin"
          icon="mdi-shield-crown"
          text="Admin"
          @update:model-value="filters = { ...filters, admin: $event }"
        />
      </v-col>
    </filter-drawer-section>
  </filter-drawer>
</template>
