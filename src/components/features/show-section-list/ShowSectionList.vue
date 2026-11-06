<script setup lang="ts">
import type { ShowSection } from '@/interfaces/api/models/ShowSection';

import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { SortableItem } from '@/components/common/sortable-item';
import { useSortableItems } from '@/composables/sortable/useSortableItems';

const { t } = useI18n();

const props = defineProps<{
  disabled?: boolean;
}>();

const sections = defineModel<ShowSection[]>('sections', { required: true });

const emit = defineEmits<{
  edit: [section: ShowSection];
  reorder: [sections: ShowSection[]];
}>();

const zoneRef = useTemplateRef<HTMLElement>('zone');

const draftSections = useSortableItems<ShowSection>(zoneRef, {
  getItems: () => sections.value,
  isDisabled: () => props.disabled,
  setItems: (value) => {
    sections.value = value;
    emit('reorder', value);
  },
});
</script>

<template>
  <div class="d-flex ga-2 flex-column" ref="zone">
    <sortable-item v-for="section in draftSections" :item="section" :key="section.id">
      <v-card>
        <v-card-text class="d-flex ga-2 align-center py-2">
          <v-icon
            :class="['handle', props.disabled ? 'text-disabled' : 'cursor-grab text-medium-emphasis']"
            icon="mdi-drag-vertical"
          />
          <v-icon>{{ section.category.icon }}</v-icon>
          <div class="text-truncate">
            <p class="text-truncate">{{ section.category.name }}</p>
            <p class="text-body-small text-medium-emphasis text-truncate" v-if="section.description">
              {{ section.description }}
            </p>
          </div>
          <v-spacer />
          <v-btn :disabled="props.disabled" variant="text" @click="emit('edit', section)">{{ t('common.edit') }}</v-btn>
        </v-card-text>
      </v-card>
    </sortable-item>
  </div>
</template>
