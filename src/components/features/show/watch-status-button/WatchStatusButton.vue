<script setup lang="ts">
import type { CombinedWatchStatus } from '@/utils/show/CombinedWatchStatus';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getWatchStatusColor } from '@/utils/show/getWatchStatusColor';
import { getWatchStatusIcon } from '@/utils/show/getWatchStatusIcon';
import { MIXED_WATCH_STATUS } from '@/utils/show/mixedWatchStatus';
import { MIXED_WATCH_STATUS_COLOR } from '@/utils/show/mixedWatchStatusColor';
import { MIXED_WATCH_STATUS_ICON } from '@/utils/show/mixedWatchStatusIcon';

const props = defineProps<{
  disabled?: boolean;
  loading?: boolean;
  /** Text appended to the button label, such as what the status applies to. */
  suffix?: string;
}>();

/** `mixed` is display-only: the menu only ever sets a single status or null. */
const status = defineModel<CombinedWatchStatus>({
  default: null,
});

const { t } = useI18n();

const statuses = Object.values(WatchStatus);

const buttonColor = computed<string | undefined>(() => {
  if (status.value === MIXED_WATCH_STATUS) return MIXED_WATCH_STATUS_COLOR;
  return status.value ? getWatchStatusColor(status.value) : undefined;
});

const buttonIcon = computed<string>(() => {
  if (status.value === MIXED_WATCH_STATUS) return MIXED_WATCH_STATUS_ICON;
  return status.value ? getWatchStatusIcon(status.value) : 'mdi-tag-outline';
});

const buttonLabel = computed<string>(() => {
  if (status.value === MIXED_WATCH_STATUS) return t('show.mixed');
  return status.value ? t(`showEntry.watchStatus.${status.value}`) : t('show.setStatus');
});
</script>

<template>
  <v-menu :close-on-content-click="true" location="bottom start">
    <template #activator="{ props: menuProps }">
      <v-btn
        :color="buttonColor"
        :disabled="props.disabled"
        :loading="props.loading"
        :prepend-icon="buttonIcon"
        :variant="status ? 'tonal' : 'outlined'"
        append-icon="mdi-menu-down"
        block
        v-bind="menuProps"
      >
        <span class="d-flex ga-2">
          {{ buttonLabel }}
          <span class="text-medium-emphasis" v-if="props.suffix">{{ props.suffix }}</span>
        </span>
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
        <v-divider class="my-2" />
        <v-list-item
          :title="t('show.clearStatus')"
          base-color="error"
          prepend-icon="mdi-close"
          @click="status = null"
        />
      </template>
    </v-list>
  </v-menu>
</template>
