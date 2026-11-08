<script setup lang="ts">
import type { StorageShowRow } from './StorageShowRow';
import type { Show } from '@/interfaces/api/models/Show';

const props = defineProps<{
  rows: StorageShowRow[];
}>();

/** The show hovered here or in the chart, shared so each highlights what the other points at. */
const highlightedShowId = defineModel<number | null>('highlightedShowId', { required: true });

const emit = defineEmits<{
  'click:show': [show: Show];
}>();
</script>

<template>
  <v-list bg-color="transparent" class="pa-0">
    <v-list-item
      v-for="row in props.rows"
      :active="highlightedShowId === row.show.id"
      @click="emit('click:show', row.show)"
      @mouseenter="highlightedShowId = row.show.id"
      @mouseleave="highlightedShowId = null"
      :key="row.show.id"
    >
      <template #prepend>
        <v-img :src="row.show.card_image_url" class="me-4" height="44" rounded="sm" width="30" cover />
      </template>

      <div class="d-flex flex-column ga-2">
        <div class="d-flex align-center ga-4">
          <span class="text-truncate flex-1-1">
            {{ row.title }}
          </span>
          <span class="text-body-small text-medium-emphasis text-no-wrap">
            {{ row.size }}
          </span>
        </div>
        <v-progress-linear
          :color="row.color"
          :model-value="row.share"
          bg-color="storage-free"
          bg-opacity="1"
          height="4"
          rounded
        />
      </div>
    </v-list-item>
  </v-list>
</template>
