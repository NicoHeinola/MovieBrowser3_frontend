<script setup lang="ts">
import type { SortOption } from './sortOption';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  options: SortOption[];
}>();

const sort = defineModel<string>({ required: true });

const { t } = useI18n();

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
        v-tooltip:bottom="
          t('common.sortBy', { option: selectedOption ? t(selectedOption.titleKey) : t('common.sortDefault') })
        "
      />
    </template>
    <v-list>
      <v-list-item
        v-for="option in props.options"
        :active="sort === option.value"
        :prepend-icon="option.icon"
        :title="t(option.titleKey)"
        @click="sort = option.value"
        :key="option.value"
      />
    </v-list>
  </v-menu>
</template>
