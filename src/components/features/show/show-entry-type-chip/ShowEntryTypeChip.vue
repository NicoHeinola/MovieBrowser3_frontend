<script setup lang="ts">
import type { ShowEntryType } from '@/enums/show/ShowEntryType';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    color?: string;
    size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large';
    type: ShowEntryType;
  }>(),
  {
    color: 'primary',
    size: 'small',
  },
);

const { t } = useI18n();
</script>

<template>
  <v-chip :color="props.color" :size="props.size">
    {{ t(`showEntry.type.${props.type}`) }}
  </v-chip>
</template>
