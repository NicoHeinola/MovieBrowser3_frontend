<script setup lang="ts">
import type { SetupStatus } from '@/interfaces/api/models/SetupStatus';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { HeadingText } from '@/components/common/heading-text';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import SetupPathStep from './SetupPathStep.vue';
import { getRules } from './setupWizardRules';

/** Folder created inside a media folder for the videos the app stores. */
const VIDEO_FOLDER_NAME = 'MovieBrowser3';

const VLC_DOWNLOAD_URL = 'https://www.videolan.org/vlc/';

const props = defineProps<{
  status: SetupStatus;
  /** Shows the finish buttons as loading while setup is being marked done. */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** The admin finished setup and picked where to go next. */
  finish: [routeName: 'admin-shows' | 'authenticated-home'];
  skip: [];
}>();

const step = ref<number>(1);

const settingStore = useSettingStore();
const { t } = useI18n();

const rules = getRules();

const stepTitles = computed<string[]>(() => [
  t('setup.welcomeStep'),
  t('setup.videoFolderStep'),
  t('setup.vlcStep'),
  t('setup.doneStep'),
]);

/** Media folders without trailing slashes, so paths can be built and compared on whole folder names. */
const mediaFolders = computed<string[]>(() =>
  props.status.media_folders.map((folder: string) => folder.replace(/[\\/]+$/, '')),
);

const videoFolderSuggestions = computed<string[]>(() =>
  mediaFolders.value.map((folder: string) => `${folder}/${VIDEO_FOLDER_NAME}`),
);

/**
 * Picks the video folder to start from. The backend's default folder isn't visible to VLC in an installed app, so a
 * folder outside every media folder is swapped for the first suggestion.
 * @returns The path to prefill.
 */
const getInitialVideoBasePath = (): string => {
  const current = settingStore.getSetting<string>('video_base_path') ?? '';
  // Compare whole folder names, so /mnt/g/New_Vid2 doesn't count as inside /mnt/g/New_Vid.
  const isInMediaFolder = mediaFolders.value.some(
    (folder: string) => current === folder || current.startsWith(`${folder}/`),
  );

  return isInMediaFolder ? current : (videoFolderSuggestions.value[0] ?? current);
};

const videoBasePath = ref<string>(getInitialVideoBasePath());
// A path the admin already saved wins over the detected one.
const vlcMediaPlayerPath = ref<string>(
  settingStore.getSetting<string>('vlc_media_player_path') || props.status.detected_vlc_media_player_path || '',
);

// The "found VLC" note only fits while the field holds the found path; otherwise its chip offers it.
const isUsingDetectedVlc = computed<boolean>(
  () => vlcMediaPlayerPath.value.trim() === props.status.detected_vlc_media_player_path,
);

// The chip would only repeat the field and the "found VLC" note, so it shows once the field holds something else.
const vlcSuggestions = computed<string[]>(() =>
  props.status.detected_vlc_media_player_path && !isUsingDetectedVlc.value
    ? [props.status.detected_vlc_media_player_path]
    : [],
);
</script>

<template>
  <v-stepper v-model="step" :items="stepTitles" border="sm" mobile-breakpoint="sm" rounded="xl" hide-actions>
    <template #item.1>
      <v-row>
        <v-col cols="12">
          <heading-text :subtitle="t('setup.welcomeSubtitle')" :title="t('setup.welcomeTitle')" />
        </v-col>
        <v-col cols="12">
          <v-list bg-color="transparent" density="compact">
            <v-list-item :title="t('setup.welcomeVideoFolder')" prepend-icon="mdi-folder-play-outline" />
            <v-list-item :title="t('setup.welcomeVlc')" prepend-icon="mdi-play-circle-outline" />
          </v-list>
        </v-col>
        <v-col class="d-flex ga-2 justify-end" cols="12">
          <v-btn variant="text" @click="emit('skip')">{{ t('setup.notNow') }}</v-btn>
          <v-btn color="primary" @click="step = 2">{{ t('setup.start') }}</v-btn>
        </v-col>
      </v-row>
    </template>

    <template #item.2>
      <setup-path-step
        v-model:path="videoBasePath"
        :label="t('settings.videoBasePath')"
        :rules="rules.videoBasePath"
        :suggestions="videoFolderSuggestions"
        setting-key="video_base_path"
        @back="step = 1"
        @next="step = 3"
      >
        <heading-text :level="2" :subtitle="t('setup.videoFolderSubtitle')" :title="t('setup.videoFolderTitle')" />

        <template #changed="{ savedPath }">
          <v-alert type="info" variant="tonal">{{ t('setup.videoFolderMoveWarning', { path: savedPath }) }}</v-alert>
        </template>
      </setup-path-step>
    </template>

    <template #item.3>
      <setup-path-step
        v-model:path="vlcMediaPlayerPath"
        :label="t('settings.vlcPath')"
        :rules="rules.vlcMediaPlayerPath"
        :suggestions="vlcSuggestions"
        setting-key="vlc_media_player_path"
        @back="step = 2"
        @next="step = 4"
      >
        <heading-text :level="2" :subtitle="t('setup.vlcSubtitle')" :title="t('setup.vlcTitle')" />
        <v-alert class="mt-4" type="success" variant="tonal" v-if="isUsingDetectedVlc">
          {{ t('setup.vlcDetected', { path: props.status.detected_vlc_media_player_path }) }}
        </v-alert>
        <v-alert class="mt-4" type="info" variant="tonal" v-else-if="!props.status.detected_vlc_media_player_path">
          {{ t('setup.vlcNotDetected') }}
          <a :href="VLC_DOWNLOAD_URL" class="text-link" rel="noopener" target="_blank">{{ t('setup.vlcDownload') }}</a>
        </v-alert>
      </setup-path-step>
    </template>

    <template #item.4>
      <v-row>
        <v-col cols="12">
          <heading-text :subtitle="t('setup.doneSubtitle')" :title="t('setup.doneTitle')">
            <template #prepend>
              <v-icon color="success" icon="mdi-check-circle" size="large" />
            </template>
          </heading-text>
        </v-col>
        <v-col class="d-flex flex-wrap ga-2 justify-end" cols="12">
          <v-btn variant="text" @click="step = 3">{{ t('setup.back') }}</v-btn>
          <v-btn :loading="props.loading" variant="tonal" @click="emit('finish', 'authenticated-home')">
            {{ t('setup.goHome') }}
          </v-btn>
          <v-btn :loading="props.loading" color="primary" @click="emit('finish', 'admin-shows')">
            {{ t('setup.addShows') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-stepper>
</template>
