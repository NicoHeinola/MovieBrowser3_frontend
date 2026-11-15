<script setup lang="ts">
import type { TaskStatusCardProps } from './taskStatusCardProps';

const props = withDefaults(defineProps<TaskStatusCardProps>(), {
  text: undefined,
  progress: null,
  progressText: undefined,
});
</script>

<template>
  <v-skeleton-loader class="bg-transparent" type="list-item-avatar-two-line" v-if="props.loading" />

  <v-sheet border="sm" class="d-flex flex-column ga-4 pa-4" color="transparent" rounded="lg" v-else>
    <div class="d-flex align-center ga-4">
      <v-avatar :color="props.type" rounded="lg" variant="tonal">
        <v-icon :icon="props.icon" />
      </v-avatar>

      <!-- min-width lets long paths wrap instead of pushing the count off the card. -->
      <div class="flex-1-1" style="min-width: 0">
        <div class="text-body-large font-weight-medium">{{ props.title }}</div>
        <div class="text-body-medium text-medium-emphasis text-break" v-if="props.text">{{ props.text }}</div>
      </div>

      <div class="text-body-medium text-medium-emphasis text-no-wrap" v-if="props.progressText">
        {{ props.progressText }}
      </div>
    </div>

    <v-progress-linear
      :color="props.type"
      :indeterminate="props.progress === null"
      :model-value="props.progress ?? 0"
      height="6"
      rounded
      v-if="props.running"
    />
  </v-sheet>
</template>
