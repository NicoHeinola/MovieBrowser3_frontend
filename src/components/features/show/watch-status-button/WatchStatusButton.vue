<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getWatchStatusColor } from '@/utils/show/getWatchStatusColor';
import { getWatchStatusIcon } from '@/utils/show/getWatchStatusIcon';

const props = defineProps<{
  disabled?: boolean;
  loading?: boolean;
}>();

const status = defineModel<WatchStatus | null>({
  default: null,
});

const { t } = useI18n();

const statuses = Object.values(WatchStatus);
</script>

<template>
  <v-menu :close-on-content-click="true" location="bottom start">
    <template #activator="{ props: menuProps }">
      <v-btn
        :color="status ? getWatchStatusColor(status) : undefined"
        :disabled="props.disabled"
        :loading="props.loading"
        :prepend-icon="status ? getWatchStatusIcon(status) : 'mdi-tag-outline'"
        :variant="status ? 'tonal' : 'outlined'"
        append-icon="mdi-menu-down"
        block
        v-bind="menuProps"
      >
        {{ status ? t(`showEntry.watchStatus.${status}`) : 'Set status' }}
      </v-btn>
    </template>

    <v-list density="compact" min-width="220" nav>
      <v-list-item
        v-for="option in statuses"
        :active="option === status"
        :color="getWatchStatusColor(option)"
        :prepend-icon="getWatchStatusIcon(option)"
        :title="t(`showEntry.watchStatus.${option}`)"
        @click="status = option"
        :key="option"
      >
        <template #append v-if="option === status">
          <v-icon icon="mdi-check" size="small" />
        </template>
      </v-list-item>

      <template v-if="status">
        <v-divider class="my-1" />
        <v-list-item base-color="error" prepend-icon="mdi-close" title="Clear status" @click="status = null" />
      </template>
    </v-list>
  </v-menu>
</template>
