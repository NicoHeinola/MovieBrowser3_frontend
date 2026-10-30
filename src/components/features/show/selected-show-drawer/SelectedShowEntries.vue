<script setup lang="ts">
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { CombinedWatchStatus } from '@/utils/show/getCombinedWatchStatus';
import { computed, ref, watch } from 'vue';
import { ShowEntrySelect } from '@/components/features/show/show-entry-select';
import { WatchStatusButton } from '@/components/features/show/watch-status-button';
import { useShowEntryWatchStatus } from '@/composables/show/useShowEntryWatchStatus';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { getCombinedWatchStatus, MIXED_WATCH_STATUS } from '@/utils/show/getCombinedWatchStatus';
import { getEpisodeName } from '@/utils/show/getEpisodeName';

const props = defineProps<{
  entries?: ShowEntry[] | null;
  isShown: boolean;
}>();

const selectedEntry = ref<ShowEntry | null>(null);
const isSavingStatus = ref<boolean>(false);

const { showAPIErrorSnackbar } = useCommonSnackbar();
const { saveWatchStatus } = useShowEntryWatchStatus();

/** The selected entry, or every entry when none is selected. */
const targetEntries = computed<ShowEntry[]>(() => {
  if (selectedEntry.value) return [selectedEntry.value];
  return props.entries ?? [];
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

watch([() => props.entries, () => props.isShown], () => {
  selectedEntry.value = null;
});
</script>

<template>
  <v-row>
    <v-col class="d-flex ga-6 align-center" cols="12">
      <show-entry-select v-model="selectedEntry" :entries="props.entries" clearable />
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
      <v-btn :disabled="!selectedEntry" append-icon="mdi-play" block> Watch Season </v-btn>
    </v-col>
  </v-row>

  <v-row v-if="selectedEntry?.episodes && selectedEntry.episodes.length > 0">
    <v-col cols="12">
      <v-divider></v-divider>
    </v-col>

    <v-col cols="12">
      <span class="text-label-medium text-medium-emphasis text-uppercase">Episodes</span>
    </v-col>

    <v-col v-for="(episode, index) in selectedEntry?.episodes" cols="12" :key="episode.id">
      <v-btn append-icon="mdi-play" class="max-width-button w-100 justify-start">
        <template #prepend>
          <span class="text-medium-emphasis text-body-small">{{ index + 1 }}</span>
        </template>
        <span class="text-truncate">
          {{ getEpisodeName(episode) }}
        </span>
        <v-spacer />
      </v-btn>
    </v-col>
  </v-row>
</template>
