<script setup lang="ts">
import type { UserSearchFilters } from '@/composables/user/UserSearchFilters';

import { useI18n } from 'vue-i18n';

import { FilterChip } from '@/components/common/filter-chip';
import { FilterDrawer, FilterDrawerSection } from '@/components/common/filter-drawer';
import { HighlightText } from '@/components/common/highlight-text';

const { t } = useI18n();

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
    <filter-drawer-section :title="t('user.role')">
      <template #subtitle>
        <i18n-t keypath="user.roleHint" tag="span">
          <template #include>
            <highlight-text color="secondary">{{ t('filter.include') }}</highlight-text>
          </template>
          <template #exclude>
            <highlight-text color="error">{{ t('filter.exclude') }}</highlight-text>
          </template>
        </i18n-t>
      </template>
      <v-col class="d-flex flex-wrap ga-2" cols="12">
        <filter-chip
          :model-value="filters.admin"
          :text="t('user.admin')"
          icon="mdi-shield-crown"
          @update:model-value="filters = { ...filters, admin: $event }"
        />
      </v-col>
    </filter-drawer-section>
  </filter-drawer>
</template>
