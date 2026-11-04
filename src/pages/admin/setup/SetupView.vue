<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { CardActionBar } from '@/components/common/card-action-bar';
import { HeadingText } from '@/components/common/heading-text';
import { MovieBackground } from '@/components/common/movie-background';
import { PageContainer } from '@/components/common/page-container';
import { SetupWizard } from '@/components/features/setup/setup-wizard';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { useSetupStore } from '@/stores/setup/useSetupStore';

const isReady = ref<boolean>(false);
const hasLoadFailed = ref<boolean>(false);

const router = useRouter();
const settingStore = useSettingStore();
const setupStore = useSetupStore();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const { t } = useI18n();

/**
 * Loads the settings and a fresh setup status, so the wizard starts from the saved paths and the latest VLC detection.
 * @returns Nothing.
 */
const load = async (): Promise<void> => {
  hasLoadFailed.value = false;
  try {
    await Promise.all([settingStore.fetchSettings(), setupStore.fetchStatus()]);
    isReady.value = true;
  } catch (error: unknown) {
    // The page has no navigation, so a failed load offers a retry and a way out instead of an endless skeleton.
    hasLoadFailed.value = true;
    showAPIErrorSnackbar(error);
  }
};

/**
 * Marks setup as done and opens the home page.
 * @returns Nothing.
 */
const finish = async (): Promise<void> => {
  try {
    await setupStore.complete();
    showSuccessSnackbar(t('setup.completed'));
    await router.push({ name: 'authenticated-home' });
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const skip = async (): Promise<void> => {
  setupStore.skip();
  await router.push({ name: 'authenticated-home' });
};

onMounted(() => {
  void load();
});
</script>

<template>
  <movie-background />
  <page-container class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-row class="position-relative" justify="center">
      <v-col cols="12" style="max-width: 720px">
        <setup-wizard
          :loading="setupStore.isLoading"
          :status="setupStore.status"
          @finish="finish"
          @skip="skip"
          v-if="isReady && setupStore.status"
        />
        <v-card border="sm" class="glass-panel" rounded="xl" v-else-if="hasLoadFailed">
          <div class="d-flex flex-column align-center ga-6 pa-8">
            <v-avatar color="warning" size="x-large" variant="tonal">
              <v-icon icon="mdi-cloud-off-outline" size="large" />
            </v-avatar>

            <heading-text :subtitle="t('setup.loadFailedText')" :title="t('setup.loadFailed')" centered />
          </div>

          <card-action-bar>
            <v-spacer />
            <v-btn variant="text" @click="void skip()">{{ t('setup.notNow') }}</v-btn>
            <v-btn
              :loading="setupStore.isLoading || settingStore.isLoading"
              color="primary"
              variant="flat"
              @click="void load()"
            >
              {{ t('setup.retry') }}
            </v-btn>
          </card-action-bar>
        </v-card>
        <v-skeleton-loader rounded="xl" type="heading, paragraph, actions" v-else />
      </v-col>
    </v-row>
  </page-container>
</template>
