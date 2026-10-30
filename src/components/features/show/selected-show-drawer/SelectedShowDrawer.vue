<script setup lang="ts">
import type { WatchStatus } from '@/enums/show/WatchStatus';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import { computed, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { ExpandableText } from '@/components/common/expandable-text';
import { SectionContainer } from '@/components/common/section-container';
import { VolumeControl } from '@/components/common/volume-control';
import { YouTubePlayer } from '@/components/common/youtube-player';
import { ShowEntrySelect } from '@/components/features/show/show-entry-select';
import { WatchStatusButton } from '@/components/features/show/watch-status-button';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showEntryWatchStatusService } from '@/services/show/showEntryWatchStatusService';
import { showService } from '@/services/show/showService';
import { getEpisodeName } from '@/utils/show/getEpisodeName';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getShowLinkTypeIcon } from '@/utils/show/getShowLinkTypeIcon';
import { getYouTubeVideoId } from '@/utils/youtube/getYouTubeVideoId';

const show = defineModel<Show | null>('show', { required: true });

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const isLoadingNextShow = ref<boolean>(false);
const isSavingStatus = ref<boolean>(false);

const selectedEntry = ref<ShowEntry | null>(null);

let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

const isDescriptionExpanded = ref<boolean>(false);

const { xlAndUp } = useDisplay();

const { showAPIErrorSnackbar } = useCommonSnackbar();

const isVideoPlaying = ref<boolean>(false);
const isVideoError = ref<boolean>(false);
const isMuted = ref<boolean>(true);
const volume = ref<number>(20);

const close = () => {
  isShown.value = false;
};

const videoId = computed<string | null>(() => getYouTubeVideoId(show.value?.preview_url ?? undefined));

const canPlayVideo = computed<boolean>(() => Boolean(isShown.value && videoId.value) && !isVideoError.value);
const activeVideoId = computed<string>(() => videoId.value ?? 'drawer-video');

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
    if (status) {
      await showEntryWatchStatusService.update(entry.id, { status });
      entry.watch_status = { show_entry_id: entry.id, status };
    } else {
      await showEntryWatchStatusService.remove(entry.id);
      entry.watch_status = null;
    }
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSavingStatus.value = false;
  }
};

const changeShow = async (showId: number) => {
  if (isLoadingNextShow.value) {
    return;
  }

  isLoadingNextShow.value = true;

  try {
    const changedShow = await showService.get(showId);
    show.value = changedShow;
  } catch (error) {
    showAPIErrorSnackbar(error);
  } finally {
    isLoadingNextShow.value = false;
  }
};

watch([() => show.value, () => isShown.value], () => {
  selectedEntry.value = null;
  isVideoPlaying.value = false;
  isVideoError.value = false;
});

watch(isShown, (newVal) => {
  if (hideTimeoutId) {
    clearTimeout(hideTimeoutId);
    hideTimeoutId = null;
  }

  if (newVal) {
    return;
  }

  /** Wait until the drawer close animation finishes. */
  hideTimeoutId = setTimeout(() => {
    isVideoPlaying.value = false;
    isVideoError.value = false;
    isDescriptionExpanded.value = false;
  }, 220);
});
</script>

<template>
  <v-navigation-drawer
    v-model="isShown"
    :width="xlAndUp ? 600 : 400"
    class="selected-show-drawer"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    temporary
  >
    <div class="h-50 position-relative overflow-hidden w-100">
      <v-fade-transition>
        <div class="youtube-video-container position-absolute top-0 left-0 w-100 h-100" v-if="canPlayVideo">
          <you-tube-player
            :muted="isMuted"
            :video-id="activeVideoId"
            :volume="volume"
            @error="isVideoError = true"
            @playing="isVideoPlaying = true"
          />
        </div>
      </v-fade-transition>

      <v-fade-transition>
        <v-img
          :src="show?.card_image_url || show?.banner_url"
          class="w-100 h-100"
          cover
          v-if="((show?.card_image_url || show?.banner_url) && (!canPlayVideo || !isVideoPlaying)) || !videoId"
        />
      </v-fade-transition>

      <div class="image-shadow position-absolute w-100 h-100 top-0 left-0">
        <section-container class="d-flex flex-column justify-end h-100">
          <div class="d-flex ga-2">
            <v-tooltip v-for="category in show?.categories" :key="category.value">
              <template #activator="{ props: tooltipProps }">
                <v-icon :icon="category.icon" color="primary" v-bind="tooltipProps"> </v-icon>
              </template>
              <span>{{ category.name }}</span>
            </v-tooltip>
          </div>

          <h1>{{ getPrimaryTitle(show) }}</h1>

          <expandable-text v-model="isDescriptionExpanded" :text="show?.description" class="text-medium-emphasis" />
        </section-container>
      </div>

      <v-fade-transition>
        <volume-control
          v-model:muted="isMuted"
          v-model:volume="volume"
          class="position-absolute left-0 top-0 ma-4"
          v-if="isVideoPlaying"
        />
      </v-fade-transition>

      <v-btn
        class="position-absolute right-0 top-0 ma-4"
        color="default"
        icon="mdi-close"
        variant="text"
        @click="close"
      />
    </div>

    <section-container class="pt-0">
      <v-row>
        <v-col class="d-flex ga-6 align-center" cols="12">
          <show-entry-select v-model="selectedEntry" :entries="show?.entries" clearable />
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

      <v-row v-if="(show?.outgoing_links?.length ?? 0) > 0">
        <v-col cols="12">
          <v-expansion-panels color="background" variant="accordion">
            <v-expansion-panel>
              <v-expansion-panel-title class="text-body-2 text-medium-emphasis">
                Related shows ({{ show?.outgoing_links?.length ?? 0 }})
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="link in show?.outgoing_links"
                    class="d-flex ga-2 justify-space-between"
                    :key="link.id"
                  >
                    <p
                      :class="{ link: !isLoadingNextShow, 'text-medium-emphasis': isLoadingNextShow }"
                      class="text-body-medium cursor-pointer text-truncate"
                      @click="changeShow(link.target_show!.id)"
                    >
                      {{ getPrimaryTitle(link.target_show) }}
                    </p>
                    <template #append>
                      <v-chip color="primary" size="small" variant="tonal">
                        <v-icon :icon="getShowLinkTypeIcon(link.type)" start />
                        {{ $t(`showLink.type.${link.type}`) }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </section-container>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
.youtube-video-container {
  :deep(iframe) {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100vh;
    height: 100vw;
    transform: translate(-50%, -50%);

    @media (max-aspect-ratio: 16/9) {
      height: 100vh;
    }
  }
}

.image-shadow {
  background: linear-gradient(to top, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface), 0.4) 100%);
}
</style>
