<script setup lang="ts">
import type { ShowEntryType } from '@/enums/show/ShowEntryType';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    color?: string;
    size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large';
    type?: ShowEntryType;
  }>(),
  {
    size: 'small',
  },
);

const { t } = useI18n();
</script>

<template>
  <v-chip :color="props.color" :size="props.size">
    {{ props.type ? t(`showEntry.type.${props.type}`) : 'No type' }}
  </v-chip>
</template>
