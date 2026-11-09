<script setup lang="ts">
import type { CombinedWatchStatus } from '@/utils/show/watch-status/CombinedWatchStatus';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { MIXED_WATCH_STATUS } from '@/utils/show/watch-status/mixedWatchStatus';
import { WATCH_STATUS_STYLES } from '@/utils/show/watch-status/watchStatusStyles';

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
  if (status.value === MIXED_WATCH_STATUS.value) return MIXED_WATCH_STATUS.color;
  return status.value ? WATCH_STATUS_STYLES[status.value].color : undefined;
});

const buttonIcon = computed<string>(() => {
  if (status.value === MIXED_WATCH_STATUS.value) return MIXED_WATCH_STATUS.icon;
  return status.value ? WATCH_STATUS_STYLES[status.value].icon : 'mdi-tag-outline';
});

const buttonLabel = computed<string>(() => {
  if (status.value === MIXED_WATCH_STATUS.value) return t(MIXED_WATCH_STATUS.titleKey);
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
        class="max-width-button"
        block
        v-bind="menuProps"
      >
        <!-- Long labels, like a status with "TV Special", truncate here instead of pushing out the button's icons. -->
        <span class="text-truncate">
          {{ buttonLabel }}
          <span class="text-medium-emphasis" v-if="props.suffix">{{ props.suffix }}</span>
        </span>
      </v-btn>
    </template>

    <v-list density="compact" min-width="220" nav>
      <v-list-item
        v-for="option in statuses"
        :active="option === status"
        :color="WATCH_STATUS_STYLES[option].color"
        :prepend-icon="WATCH_STATUS_STYLES[option].icon"
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
