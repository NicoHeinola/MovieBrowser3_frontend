<script setup lang="ts">
import type { Episode } from '@/interfaces/api/models/Episode';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { CombinedWatchStatus } from '@/utils/show/CombinedWatchStatus';
import { useStorage } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { CollapsibleSection } from '@/components/common/collapsible-section';
import { SplitButton } from '@/components/common/split-button';
import { MissingVideoFileChip } from '@/components/features/show/missing-video-file-chip';
import { ShowEntryPicker } from '@/components/features/show/show-entry-picker';
import { WatchStatusButton } from '@/components/features/show/watch-status-button';
import { useShowEntryWatchStatus } from '@/composables/show/useShowEntryWatchStatus';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { formatPlaybackTime } from '@/utils/show/formatPlaybackTime';
import { getCombinedWatchStatus } from '@/utils/show/getCombinedWatchStatus';
import { getEpisodeName } from '@/utils/show/getEpisodeName';
import { getWatchedEpisodeIds } from '@/utils/show/getWatchedEpisodeIds';
import { isEpisodeVideoMissing } from '@/utils/show/isEpisodeVideoMissing';
import { MIXED_WATCH_STATUS } from '@/utils/show/mixedWatchStatus';
import { useSelectedEntry } from './useSelectedEntry';
import { useSelectedShowPlayback } from './useSelectedShowPlayback';

const props = defineProps<{
  isShown: boolean;
  show: Show | null;
}>();

const emit = defineEmits<{
  /** A playback is being started, so the drawer's own preview video should go quiet. */
  'playback-start': [];
}>();

const isSavingStatus = ref<boolean>(false);

const entries = computed<ShowEntry[]>(() => props.show?.entries ?? []);
const show = computed<Show | null>(() => props.show);

/** Whether the episode list is open, remembered across drawers and reloads. */
const isEpisodesOpen = useStorage<boolean>('showDrawer.isEpisodesOpen', true);

const { showAPIErrorSnackbar } = useCommonSnackbar();
const { saveWatchStatus } = useShowEntryWatchStatus();
const { resetSelectedEntry, selectedEntry } = useSelectedEntry(entries);
const { t } = useI18n();
const {
  isContinuing,
  isStartingPlayback,
  isStartingTarget,
  resumeEpisode,
  resumePosition,
  startingEpisodeId,
  watchEpisode: startEpisode,
  watchTarget: startTarget,
} = useSelectedShowPlayback(show, selectedEntry);

/**
 * Continues the selected entry, muting the drawer's preview video first.
 * @param fromStart - Start the episode over instead of resuming at the saved position.
 */
const watchTarget = async (fromStart = false): Promise<void> => {
  emit('playback-start');
  await startTarget(fromStart);
};

/**
 * Plays one episode, muting the drawer's preview video first.
 * @param episode - The episode to start from.
 */
const watchEpisode = async (episode: Episode): Promise<void> => {
  emit('playback-start');
  await startEpisode(episode);
};

/** The selected entry, or every entry when none is selected. */
const targetEntries = computed<ShowEntry[]>(() => {
  if (selectedEntry.value) return [selectedEntry.value];
  return entries.value;
});

/** Episodes before the last started one or in a completed entry, which count as watched. */
const watchedEpisodeIds = computed<Set<number>>(() => getWatchedEpisodeIds(props.show));

/**
 * Resolves how an episode's number chip shows its progress. The episode's button shares the chip color.
 * The last watched episode wins over watched, so it stays findable inside a completed entry.
 * @param episodeId - The episode to look up.
 * @returns The chip color, icon and variant: last watched, watched, or neither.
 */
const getEpisodeChipProps = (episodeId: number): { color?: string; prependIcon?: string; variant?: 'flat' } => {
  if (episodeId === props.show?.watch_progress?.episode_id) {
    return { color: 'secondary', prependIcon: 'mdi-play-circle', variant: 'flat' };
  }
  if (watchedEpisodeIds.value.has(episodeId)) return { color: 'success', prependIcon: 'mdi-check' };
  return {};
};

/** How far into the last watched episode the user is, as `12:34 / 24:00` and a percentage for its progress bar. */
const episodeProgress = computed<{ label: string; percent: number | null } | null>(() => {
  const position = props.show?.watch_progress?.position_seconds;
  const duration = props.show?.watch_progress?.duration_seconds;

  if (!position) {
    return null;
  }

  if (!duration) {
    return { label: formatPlaybackTime(position), percent: null };
  }

  return {
    label: `${formatPlaybackTime(position)} / ${formatPlaybackTime(duration)}`,
    percent: Math.min(100, (position / duration) * 100),
  };
});

/** The label of the main watch button: resume at a saved position, continue an episode, or start the show. */
const watchTargetLabel = computed<string>(() => {
  if (resumePosition.value !== null) {
    return t('show.resumeAt', { time: formatPlaybackTime(resumePosition.value) });
  }

  return isContinuing.value ? t('show.continueWatching') : t('show.startWatching');
});

const targetStatus = computed<CombinedWatchStatus>(() => getCombinedWatchStatus(targetEntries.value));

/**
 * Persists a watch status for the targeted entries, overwriting any status they already have.
 * Entries that already have the status are skipped, and the rest are still saved when one of them fails.
 * The saved statuses reach the shown show through the query cache.
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
    const results = await Promise.allSettled(entries.map((entry) => saveWatchStatus(entry, status)));

    const failure = results.find((result) => result.status === 'rejected');
    if (failure) {
      showAPIErrorSnackbar(failure.reason);
    }
  } finally {
    isSavingStatus.value = false;
  }
};

watch([() => props.show?.id, () => props.isShown], () => {
  // Open on the last watched entry, so its episodes and the last played one show straight away.
  resetSelectedEntry(props.show?.watch_progress?.show_entry_id ?? null);
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <show-entry-picker
        v-model="selectedEntry"
        :entries="entries"
        :watching-entry-id="show?.watch_progress?.show_entry_id"
      />
    </v-col>
    <!-- The drawer is only 400px wide below xl, too narrow for these two buttons side by side. -->
    <v-col cols="12" xl="6">
      <watch-status-button
        :disabled="targetEntries.length === 0"
        :loading="isSavingStatus"
        :model-value="targetStatus"
        :suffix="
          selectedEntry
            ? t('show.suffixEntry', { type: t(`showEntry.type.${selectedEntry.type}`) })
            : t('show.suffixShow')
        "
        @update:model-value="setWatchStatus"
      />
    </v-col>
    <v-col cols="12" xl="6">
      <!-- Starting over hides behind the arrow, so a stray click can't throw away the saved position. -->
      <split-button
        :disabled="!resumeEpisode || (isStartingPlayback && !isStartingTarget)"
        :loading="isStartingTarget"
        :menu-disabled="isStartingPlayback"
        :menu-label="t('show.moreWatchOptions')"
        append-icon="mdi-play"
        color="primary"
        block
        @click="watchTarget()"
      >
        {{ watchTargetLabel }}
        <template #menu v-if="resumePosition !== null">
          <v-list-item :title="t('show.playFromStart')" prepend-icon="mdi-restart" @click="watchTarget(true)" />
        </template>
      </split-button>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <v-divider></v-divider>
    </v-col>
  </v-row>

  <collapsible-section v-model="isEpisodesOpen" :title="t('show.episodes')">
    <v-col cols="12" v-if="!selectedEntry">
      <v-alert class="flex-0-1" type="info" variant="tonal">{{ t('show.selectEntry') }}</v-alert>
    </v-col>

    <v-col cols="12" v-else-if="!selectedEntry.episodes || selectedEntry.episodes.length === 0">
      <v-alert class="flex-0-1" type="info" variant="tonal">{{ t('show.noEpisodes') }}</v-alert>
    </v-col>

    <!-- A grid keeps the number column as wide as its widest chip, so every row lines up. -->
    <v-col
      class="gc-2 gr-6 align-center"
      cols="12"
      style="display: grid; grid-template-columns: auto minmax(0, 1fr)"
      v-if="selectedEntry?.episodes?.length"
    >
      <template v-for="(episode, index) in selectedEntry.episodes" :key="episode.id">
        <v-chip
          v-bind="getEpisodeChipProps(episode.id)"
          style="justify-self: start"
          v-tooltip:top="episode.id === show?.watch_progress?.episode_id ? t('show.lastWatched') : undefined"
        >
          {{ index + 1 }}
        </v-chip>
        <v-btn
          :color="getEpisodeChipProps(episode.id).color"
          :disabled="isStartingPlayback && startingEpisodeId !== episode.id"
          :loading="startingEpisodeId === episode.id"
          append-icon="mdi-play"
          class="max-width-button text-truncate justify-start"
          @click="watchEpisode(episode)"
        >
          <span class="text-truncate">
            {{ getEpisodeName(episode) }}
          </span>
          <v-spacer />
          <missing-video-file-chip class="ml-2" v-if="isEpisodeVideoMissing(episode)" />
          <template v-if="episodeProgress && episode.id === show?.watch_progress?.episode_id">
            <span class="text-label-small">{{ episodeProgress.label }}</span>
            <v-progress-linear
              :model-value="episodeProgress.percent ?? 0"
              height="3"
              location="bottom"
              absolute
              v-if="episodeProgress.percent !== null"
            />
          </template>
        </v-btn>
      </template>
    </v-col>
  </collapsible-section>
</template>
