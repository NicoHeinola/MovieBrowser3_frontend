<script setup lang="ts">
import type { ShowEditorEpisodeProgress } from '@/composables/show/ShowEditorEpisodeProgress';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  /** Whether the show has not been created yet. */
  isNew: boolean;
  /** Whether the draft differs from the saved show. */
  hasChanges: boolean;
  isSaving: boolean;
  /** Whether the show is being deleted, which blocks saving and discarding. */
  isDeleting: boolean;
  /** How far the episode uploads are while saving, or null while there are none. */
  episodeProgress: ShowEditorEpisodeProgress | null;
}>();

const emit = defineEmits<{
  save: [];
  discard: [];
}>();

const { t } = useI18n();

const isBusy = computed<boolean>(() => props.isSaving || props.isDeleting);

/** The save state in words, with the color of the dot beside it. */
const status = computed<{ text: string; color: string }>(() => {
  if (props.episodeProgress) {
    const { done, total } = props.episodeProgress;

    // Count the episode being uploaded, not the finished ones, so a long first upload doesn't read "0 of 3".
    return {
      text: t('showEditor.savingEpisode', { current: Math.min(done + 1, total), total }),
      color: 'primary',
    };
  }

  if (props.isSaving) {
    return { text: t('showEditor.saving'), color: 'primary' };
  }

  if (props.isNew) {
    return { text: t('showEditor.notCreated'), color: 'warning' };
  }

  if (props.hasChanges) {
    return { text: t('showEditor.unsavedChanges'), color: 'warning' };
  }

  return { text: t('showEditor.allSaved'), color: 'success' };
});
</script>

<template>
  <div class="position-fixed bottom-0 left-0 w-100 d-flex justify-center pa-6 z-100" style="pointer-events: none">
    <v-sheet
      border="sm"
      class="glass-panel high d-flex align-center ga-4 py-2 pl-5 pr-2 w-100"
      elevation="8"
      max-width="600"
      rounded="pill"
      style="pointer-events: auto"
    >
      <div class="d-flex align-center ga-2 flex-1-1" style="min-width: 0">
        <v-badge :color="status.color" dot inline />
        <span aria-live="polite" class="text-body-medium text-truncate">{{ status.text }}</span>
      </div>

      <div class="d-flex align-center ga-2">
        <v-btn :disabled="!props.hasChanges || isBusy" rounded="pill" variant="text" @click="emit('discard')">
          {{ t('showEditor.discard') }}
        </v-btn>
        <v-btn
          :disabled="!props.hasChanges || props.isDeleting"
          :loading="props.isSaving"
          color="primary"
          min-width="120"
          prepend-icon="mdi-content-save"
          rounded="pill"
          variant="flat"
          @click="emit('save')"
          v-tooltip:top="t('showEditor.saveShortcut')"
        >
          {{ props.isNew ? t('showEditor.create') : t('common.save') }}
        </v-btn>
      </div>
    </v-sheet>
  </div>
</template>
