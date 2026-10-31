<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { CombinedWatchStatus } from '@/utils/show/getCombinedWatchStatus';
import { computed, ref, watch } from 'vue';
import { ShowEntrySelect } from '@/components/features/show/show-entry-select';
import { WatchStatusButton } from '@/components/features/show/watch-status-button';
import { useShowEntryWatchStatus } from '@/composables/show/useShowEntryWatchStatus';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { getCombinedWatchStatus, MIXED_WATCH_STATUS } from '@/utils/show/getCombinedWatchStatus';
import { getEpisodeName } from '@/utils/show/getEpisodeName';
import { useSelectedShowPlayback } from './useSelectedShowPlayback';

const props = defineProps<{
  isShown: boolean;
}>();

const show = defineModel<Show | null>('show', { required: true });

const selectedEntry = ref<ShowEntry | null>(null);
const isSavingStatus = ref<boolean>(false);

const { showAPIErrorSnackbar } = useCommonSnackbar();
const { saveWatchStatus } = useShowEntryWatchStatus();
const {
  isContinuing,
  isStartingPlayback,
  isStartingTarget,
  resumeEpisode,
  startingEpisodeId,
  watchEpisode,
  watchTarget,
} = useSelectedShowPlayback(show, selectedEntry);

const entries = computed<ShowEntry[]>(() => show.value?.entries ?? []);

/** The selected entry, or every entry when none is selected. */
const targetEntries = computed<ShowEntry[]>(() => {
  if (selectedEntry.value) return [selectedEntry.value];
  return entries.value;
});

const targetStatus = computed<CombinedWatchStatus>(() => getCombinedWatchStatus(targetEntries.value));

/**
 * Persists a watch status for the targeted entries, overwriting any status they already have.
 * Entries that already have the status are skipped, and the rest are still saved when one of them fails.
 * @param status - The new watch status, or null to clear it. `mixed` is display-only and ignored.
 */
const setWatchStatus = async (status: CombinedWatchStatus): Promise<void> => {
  if (status === MIXED_WATCH_STATUS) {
    return;
  }

  const entries = targetEntries.value.filter((entry) => (entry.watch_status?.status ?? null) !== status);

  if (entries.length === 0 || isSavingStatus.value) {
    return;
  }

  isSavingStatus.value = true;

  try {
    const results = await Promise.allSettled(
      entries.map(async (entry) => {
        entry.watch_status = await saveWatchStatus(entry, status);
      }),
    );

    const failure = results.find((result) => result.status === 'rejected');
    if (failure) {
      showAPIErrorSnackbar(failure.reason);
    }
  } finally {
    isSavingStatus.value = false;
  }
};

watch([() => show.value?.entries, () => props.isShown], () => {
  selectedEntry.value = null;
});
</script>

<template>
  <v-row>
    <v-col class="d-flex ga-6 align-center" cols="12">
      <show-entry-select v-model="selectedEntry" :entries="entries" clearable />
    </v-col>
    <v-col cols="6">
      <watch-status-button
        :disabled="targetEntries.length === 0"
        :loading="isSavingStatus"
        :model-value="targetStatus"
        :suffix="selectedEntry ? '(Entry)' : '(Show)'"
        @update:model-value="setWatchStatus"
      />
    </v-col>
    <v-col cols="6">
      <v-btn
        :disabled="!resumeEpisode || (isStartingPlayback && !isStartingTarget)"
        :loading="isStartingTarget"
        append-icon="mdi-play"
        block
        @click="watchTarget"
      >
        {{ isContinuing ? 'Continue watching' : 'Start watching' }}
      </v-btn>
    </v-col>
  </v-row>

  <v-row v-if="selectedEntry?.episodes && selectedEntry.episodes.length > 0">
    <v-col cols="12">
      <v-divider></v-divider>
    </v-col>

    <v-col cols="12">
      <span class="text-label-medium text-medium-emphasis text-uppercase">Episodes</span>
    </v-col>

    <v-col v-for="(episode, index) in selectedEntry?.episodes" class="d-flex ga-2" cols="12" :key="episode.id">
      <div style="min-width: 40px">
        <v-chip class="flex-0-1">{{ index + 1 }}</v-chip>
      </div>
      <v-btn
        :active="episode.id === show?.watch_progress?.episode_id"
        :disabled="isStartingPlayback && startingEpisodeId !== episode.id"
        :loading="startingEpisodeId === episode.id"
        append-icon="mdi-play"
        class="flex-1-1 max-width-button text-truncate justify-start"
        @click="watchEpisode(episode)"
      >
        <span class="text-truncate">
          {{ getEpisodeName(episode) }}
        </span>
        <v-spacer />
      </v-btn>
    </v-col>
  </v-row>
</template>
