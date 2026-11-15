<script setup lang="ts">
import type { ShowSaveWork } from '@/composables/show/useShowSaveTimeLeft';
import type { ShowEditorEpisodeProgress } from '@/interfaces/show/ShowEditorEpisodeProgress';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useShowSaveTimeLeft } from '@/composables/show/useShowSaveTimeLeft';
import { formatFileSizeRatio } from '@/utils/file/formatFileSizeRatio';
import { formatDuration } from '@/utils/time/formatDuration';

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

const { t, locale } = useI18n();

const isBusy = computed<boolean>(() => props.isSaving || props.isDeleting);

/** The save state in words, with the color of its indicator. */
const status = computed<{ text: string; color: string }>(() => {
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

/**
 * How much of the episode sync is done, or null while the save has no episode progress to count. Counted in bytes
 * when files upload, as a big file takes far longer than a rename, and in episodes otherwise.
 */
const work = computed<ShowSaveWork | null>(() => {
  const progress = props.episodeProgress;

  if (!progress) {
    return null;
  }

  if (progress.bytesTotal > 0) {
    const done = progress.bytesTotal - progress.bytesLeft;
    return { done, total: progress.bytesTotal, current: progress.bytesCurrent };
  }

  return { done: progress.done, total: progress.total, current: 1 };
});

/** How far the episode sync is, from 0 to 100, or null while there is no progress to count. */
const percent = computed<number | null>(() => (work.value ? (work.value.done / work.value.total) * 100 : null));

const { secondsLeft } = useShowSaveTimeLeft(() => work.value);

/**
 * What the episode sync has done out of all, beside the status: episodes, video bytes when files upload, and the
 * estimated time left. `narrow` counters still show on phone widths.
 */
const counters = computed<{ icon: string; label: string; text: string; narrow: boolean }[]>(() => {
  const progress = props.episodeProgress;

  if (!progress) {
    return [];
  }

  const items = [
    {
      icon: 'mdi-filmstrip',
      label: t('showEditor.episodesSaved'),
      text: `${progress.done} / ${progress.total}`,
      narrow: true,
    },
  ];

  if (progress.bytesTotal > 0) {
    items.push({
      icon: 'mdi-harddisk',
      label: t('showEditor.videoUploaded'),
      text: formatFileSizeRatio(progress.bytesTotal - progress.bytesLeft, progress.bytesTotal, locale.value),
      narrow: false,
    });
  }

  // Always there, so it doesn't pop in: dashes until the first episode gives a pace.
  items.push({
    icon: 'mdi-timer-sand',
    label: t('showEditor.timeLeft'),
    text: secondsLeft.value === null ? '–:––' : `~${formatDuration(secondsLeft.value)}`,
    narrow: true,
  });

  return items;
});
</script>

<template>
  <div class="position-fixed bottom-0 left-0 w-100 d-flex justify-center pa-6 z-100" style="pointer-events: none">
    <v-sheet
      border="sm"
      class="glass-panel high d-flex align-center ga-4 py-2 pl-5 pr-2 w-100"
      elevation="8"
      max-width="640"
      rounded="pill"
      style="pointer-events: auto"
    >
      <div class="d-flex align-center ga-4 flex-1-1 overflow-hidden" style="min-width: 0">
        <!-- Fills while episodes save, and spins through the quick steps before and after them. -->
        <v-progress-circular
          :color="status.color"
          :indeterminate="percent === null"
          :model-value="percent ?? 0"
          size="18"
          width="2"
          v-if="props.isSaving"
        />
        <v-badge :color="status.color" dot inline v-else />
        <!-- Only the status is announced: the timer ticks every second. -->
        <span aria-live="polite" class="text-body-medium text-truncate">
          {{ status.text }}
        </span>
        <span
          v-for="counter in counters"
          :aria-label="`${counter.label}: ${counter.text}`"
          :class="[
            'align-center ga-2 text-body-small text-medium-emphasis text-no-wrap',
            counter.narrow ? 'd-flex' : 'd-none d-sm-flex',
          ]"
          :key="counter.icon"
          v-tooltip:top="counter.label"
        >
          <v-icon :icon="counter.icon" size="small" />
          {{ counter.text }}
        </span>
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
