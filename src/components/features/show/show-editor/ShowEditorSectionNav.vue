<script setup lang="ts">
import type { ShowEditorSection } from './ShowEditorSection';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  sections: ShowEditorSection[];
  /** The id of the section being read. */
  activeId: string;
}>();

const emit = defineEmits<{
  /** A section was picked; carries its id. */
  select: [id: string];
}>();

const { t } = useI18n();
</script>

<template>
  <v-list class="bg-transparent pa-0" color="primary" density="comfortable" nav>
    <v-list-item
      v-for="section in props.sections"
      :active="section.id === props.activeId"
      :prepend-icon="section.icon"
      :title="section.title"
      rounded="lg"
      @click="emit('select', section.id)"
      :key="section.id"
    >
      <template #append>
        <v-icon
          color="error"
          icon="mdi-alert-circle"
          size="small"
          v-tooltip:end="t('showEditor.sectionInvalid')"
          v-if="section.isInvalid"
        />
        <span class="text-body-small text-medium-emphasis" v-else-if="section.count !== undefined">
          {{ section.count }}
        </span>
      </template>
    </v-list-item>
  </v-list>
</template>
