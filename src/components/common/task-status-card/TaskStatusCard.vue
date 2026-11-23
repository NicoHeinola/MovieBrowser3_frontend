<script setup lang="ts">
import type { TaskStatusCardProps } from './taskStatusCardProps';

import { IconCard } from '@/components/common/icon-card';

const props = withDefaults(defineProps<TaskStatusCardProps>(), {
  text: undefined,
  progress: null,
  progressText: undefined,
});
</script>

<template>
  <v-skeleton-loader class="bg-transparent" type="list-item-avatar-two-line" v-if="props.loading" />

  <icon-card :color="props.type" :icon="props.icon" :text="props.text" :title="props.title" v-else>
    <template #append v-if="props.progressText">
      <div class="text-body-medium text-medium-emphasis text-no-wrap">{{ props.progressText }}</div>
    </template>

    <v-progress-linear
      :color="props.type"
      :indeterminate="props.progress === null"
      :model-value="props.progress ?? 0"
      height="6"
      rounded
      v-if="props.running"
    />
  </icon-card>
</template>
