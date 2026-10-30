<script setup lang="ts">
import type { ShowSection } from '@/interfaces/api/models/ShowSection';

import { makeDroppable } from '@vue-dnd-kit/core';
import { useTemplateRef } from 'vue';
import { SortableItem } from '@/components/common/sortable-item';

const props = defineProps<{
  disabled?: boolean;
}>();

const sections = defineModel<ShowSection[]>('sections', { required: true });

const emit = defineEmits<{
  edit: [section: ShowSection];
  reorder: [sections: ShowSection[]];
}>();

const zoneRef = useTemplateRef<HTMLElement>('zone');

makeDroppable(
  zoneRef,
  {
    groups: ['show-section'],
  },
  () => sections.value,
);
</script>

<template>
  <div class="d-flex ga-3 flex-column" ref="zone">
    <transition-group name="show-section">
      <sortable-item
        v-for="(section, i) in sections"
        :drag-options="{ dragHandle: '.handle', groups: ['show-section'] }"
        :drag-payload="() => [i, sections]"
        @sorted="emit('reorder', sections)"
        :key="section.id"
      >
        <v-card>
          <v-card-text class="d-flex ga-2 align-center py-2">
            <v-icon
              :class="props.disabled ? 'text-disabled' : 'handle cursor-grab text-medium-emphasis'"
              icon="mdi-drag-vertical"
            />
            <v-icon>{{ section.category.icon }}</v-icon>
            <div class="text-truncate">
              <p class="text-truncate">{{ section.category.name }}</p>
              <p class="text-caption text-medium-emphasis text-truncate" v-if="section.description">
                {{ section.description }}
              </p>
            </div>
            <v-spacer />
            <v-btn :disabled="props.disabled" variant="text" @click="emit('edit', section)">Edit</v-btn>
          </v-card-text>
        </v-card>
      </sortable-item>
    </transition-group>
  </div>
</template>

<style scoped>
.show-section-move {
  transition: transform 0.25s;
}
</style>
