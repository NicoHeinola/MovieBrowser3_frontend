<script setup lang="ts">
import type { SetupStatus } from '@/interfaces/api/models/SetupStatus';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CardActionBar } from '@/components/common/card-action-bar';
import { HeadingText } from '@/components/common/heading-text';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import { getInitialVideoBasePath } from './getInitialVideoBasePath';
import { getVideoFolderSuggestions } from './getVideoFolderSuggestions';
import SetupHighlightText from './SetupHighlightText.vue';
import SetupPathStep from './SetupPathStep.vue';
import { getRules } from './setupWizardRules';

const VLC_DOWNLOAD_URL = 'https://www.videolan.org/vlc/';

/** What the welcome step says is coming, as icons and i18n keys. */
const WELCOME_ITEMS = [
  { icon: 'mdi-folder-play-outline', textKey: 'setup.welcomeVideoFolder' },
  { icon: 'mdi-play-circle-outline', textKey: 'setup.welcomeVlc' },
];

const VIDEO_FOLDER_FORM_ID = 'setup-video-folder-form';
const VLC_FORM_ID = 'setup-vlc-form';

/** The form of each path step, keyed by step number, so the footer's Next button submits the step on screen. */
const PATH_STEP_FORM_IDS: Record<number, string> = {
  2: VIDEO_FOLDER_FORM_ID,
  3: VLC_FORM_ID,
};

const props = defineProps<{
  status: SetupStatus;
  /** Shows the finish button as loading while setup is being marked done. */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** The admin finished setup. */
  finish: [];
  skip: [];
}>();

const step = ref<number>(1);
/** Whether each path step's form is valid, keyed by step number: both are mounted while the steps slide past. */
const validPathSteps = ref<Record<number, boolean>>({});
const isSubmittingPath = ref<boolean>(false);

const settingStore = useSettingStore();
const { t } = useI18n();

const rules = getRules();

const stepTitles = computed<string[]>(() => [
  t('setup.welcomeStep'),
  t('setup.videoFolderStep'),
  t('setup.vlcStep'),
  t('setup.doneStep'),
]);

const activeFormId = computed<string | undefined>(() => PATH_STEP_FORM_IDS[step.value]);

/** Media folders without trailing slashes, so paths can be built and compared on whole folder names. */
const mediaFolders = computed<string[]>(() =>
  props.status.media_folders.map((folder: string) => folder.replace(/[\\/]+$/, '')),
);

const videoFolderSuggestions = computed<string[]>(() => getVideoFolderSuggestions(mediaFolders.value));

const videoBasePath = ref<string>(
  getInitialVideoBasePath(settingStore.getSetting<string>('video_base_path') ?? '', mediaFolders.value),
);
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
  <v-stepper v-model="step" border="sm" class="glass-panel" mobile-breakpoint="sm" rounded="xl">
    <v-stepper-header>
      <template v-for="(title, index) in stepTitles" :key="title">
        <v-divider v-if="index > 0" />
        <v-stepper-item :complete="step > index + 1" :title="title" :value="index + 1" color="primary" />
      </template>
    </v-stepper-header>

    <v-stepper-window class="ma-0">
      <v-stepper-window-item :value="1" class="pa-8">
        <div class="d-flex flex-column align-center ga-6">
          <v-img alt="" aspect-ratio="1" class="flex-0-0" src="/icons/logo.svg" width="72" />

          <heading-text :title="t('setup.welcomeTitle')" centered>
            <template #subtitle>
              <setup-highlight-text highlight-key="setup.welcomeHighlight" keypath="setup.welcomeSubtitle" />
            </template>
          </heading-text>

          <v-row class="w-100">
            <v-col v-for="item in WELCOME_ITEMS" cols="12" sm="6" :key="item.textKey">
              <v-sheet
                border="sm"
                class="d-flex flex-column align-center ga-2 pa-4 h-100 text-center"
                color="transparent"
                rounded="lg"
              >
                <v-icon :icon="item.icon" color="primary" />
                <span class="text-body-medium">{{ t(item.textKey) }}</span>
              </v-sheet>
            </v-col>
          </v-row>
        </div>
      </v-stepper-window-item>

      <v-stepper-window-item :value="2" class="pa-8">
        <setup-path-step
          v-model:is-submitting="isSubmittingPath"
          v-model:is-valid="validPathSteps[2]"
          v-model:path="videoBasePath"
          :form-id="VIDEO_FOLDER_FORM_ID"
          :label="t('settings.videoBasePath')"
          :rules="rules.videoBasePath"
          :suggestions="videoFolderSuggestions"
          setting-key="video_base_path"
          @saved="step = 3"
        >
          <heading-text :level="2" :title="t('setup.videoFolderTitle')">
            <template #subtitle>
              <setup-highlight-text highlight-key="setup.videoFolderHighlight" keypath="setup.videoFolderSubtitle" />
            </template>
          </heading-text>

          <template #changed="{ savedPath }">
            <v-alert class="mt-4" type="info" variant="tonal">
              {{ t('setup.videoFolderMoveWarning', { path: savedPath }) }}
            </v-alert>
          </template>
        </setup-path-step>
      </v-stepper-window-item>

      <v-stepper-window-item :value="3" class="pa-8">
        <setup-path-step
          v-model:is-submitting="isSubmittingPath"
          v-model:is-valid="validPathSteps[3]"
          v-model:path="vlcMediaPlayerPath"
          :form-id="VLC_FORM_ID"
          :label="t('settings.vlcPath')"
          :rules="rules.vlcMediaPlayerPath"
          :suggestions="vlcSuggestions"
          setting-key="vlc_media_player_path"
          @saved="step = 4"
        >
          <heading-text :level="2" :title="t('setup.vlcTitle')">
            <template #subtitle>
              <setup-highlight-text highlight-key="setup.vlcHighlight" keypath="setup.vlcSubtitle" />
            </template>
          </heading-text>

          <template #notices>
            <v-alert class="mt-4" type="success" variant="tonal" v-if="isUsingDetectedVlc">
              {{ t('setup.vlcDetected') }}
            </v-alert>
            <v-alert class="mt-4" type="info" variant="tonal" v-else-if="!props.status.detected_vlc_media_player_path">
              {{ t('setup.vlcNotDetected') }}
              <a :href="VLC_DOWNLOAD_URL" class="text-link" rel="noopener" target="_blank">
                {{ t('setup.vlcDownload') }}
              </a>
            </v-alert>
          </template>
        </setup-path-step>
      </v-stepper-window-item>

      <v-stepper-window-item :value="4" class="pa-8">
        <div class="d-flex flex-column align-center ga-6">
          <v-scale-transition appear>
            <v-avatar color="success" size="x-large" variant="tonal">
              <v-icon icon="mdi-check-bold" size="large" />
            </v-avatar>
          </v-scale-transition>

          <heading-text :title="t('setup.doneTitle')" centered>
            <template #subtitle>
              <setup-highlight-text highlight-key="setup.doneHighlight" keypath="setup.doneSubtitle" />
            </template>
          </heading-text>
        </div>
      </v-stepper-window-item>
    </v-stepper-window>

    <card-action-bar>
      <v-spacer />

      <v-btn variant="text" @click="emit('skip')" v-if="step === 1">{{ t('setup.notNow') }}</v-btn>
      <v-btn :disabled="isSubmittingPath || props.loading" variant="text" @click="step--" v-else>
        {{ t('setup.back') }}
      </v-btn>

      <v-btn color="primary" variant="flat" @click="step = 2" v-if="step === 1">{{ t('setup.start') }}</v-btn>
      <v-btn
        :disabled="!validPathSteps[step]"
        :form="activeFormId"
        :loading="isSubmittingPath"
        color="primary"
        type="submit"
        variant="flat"
        v-else-if="activeFormId"
      >
        {{ t('setup.next') }}
      </v-btn>
      <v-btn :loading="props.loading" color="primary" variant="flat" @click="emit('finish')" v-else>
        {{ t('setup.goHome') }}
      </v-btn>
    </card-action-bar>
  </v-stepper>
</template>
