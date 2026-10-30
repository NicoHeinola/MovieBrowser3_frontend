<script setup lang="ts">
import type { WatchStatus } from '@/enums/show/WatchStatus';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import { ref, watch } from 'vue';
import { ShowEntrySelect } from '@/components/features/show/show-entry-select';
import { WatchStatusButton } from '@/components/features/show/watch-status-button';
import { useShowEntryWatchStatus } from '@/composables/show/useShowEntryWatchStatus';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { getEpisodeName } from '@/utils/show/getEpisodeName';

const props = defineProps<{
  entries?: ShowEntry[] | null;
  isShown: boolean;
}>();

const selectedEntry = ref<ShowEntry | null>(null);
const isSavingStatus = ref<boolean>(false);

const { showAPIErrorSnackbar } = useCommonSnackbar();
const { saveWatchStatus } = useShowEntryWatchStatus();

/**
 * Persists a watch status for the selected entry and mirrors the chosen status onto it.
 * @param status - The new watch status, or null to clear it.
 */
const setWatchStatus = async (status: WatchStatus | null): Promise<void> => {
  const entry = selectedEntry.value;

  if (!entry || isSavingStatus.value) {
    return;
  }

  isSavingStatus.value = true;

  try {
    entry.watch_status = await saveWatchStatus(entry, status);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
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
        :disabled="!selectedEntry"
        :loading="isSavingStatus"
        :model-value="selectedEntry?.watch_status?.status ?? null"
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
