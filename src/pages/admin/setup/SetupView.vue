<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { PageBackground } from '@/components/common/page-background';
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
 * Marks setup as done and opens the page the admin picked.
 * @param routeName - Where to go next.
 * @returns Nothing.
 */
const finish = async (routeName: string): Promise<void> => {
  try {
    await setupStore.complete();
    showSuccessSnackbar(t('setup.completed'));
    await router.push({ name: routeName });
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
  <page-background />
  <page-container>
    <v-row class="position-relative" justify="center">
      <v-col cols="12" lg="8" xl="6">
        <setup-wizard
          :loading="setupStore.isLoading"
          :status="setupStore.status"
          @finish="finish"
          @skip="skip"
          v-if="isReady && setupStore.status"
        />
        <v-card border="sm" rounded="xl" v-else-if="hasLoadFailed">
          <v-empty-state :text="t('setup.loadFailedText')" :title="t('setup.loadFailed')" icon="mdi-cloud-off-outline">
            <template #actions>
              <v-btn variant="text" @click="void skip()">{{ t('setup.notNow') }}</v-btn>
              <v-btn
                :loading="setupStore.isLoading || settingStore.isLoading"
                color="primary"
                prepend-icon="mdi-refresh"
                @click="void load()"
              >
                {{ t('setup.retry') }}
              </v-btn>
            </template>
          </v-empty-state>
        </v-card>
        <v-skeleton-loader rounded="xl" type="heading, paragraph, actions" v-else />
      </v-col>
    </v-row>
  </page-container>
</template>
