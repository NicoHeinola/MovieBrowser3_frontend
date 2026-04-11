<script setup lang="ts">
import { onMounted } from 'vue';

import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { AddDefaultBackgroundDialog } from '@/components/features/setting/add-default-background-dialog';
import { DefaultBackgroundsTable } from '@/components/features/setting/default-backgrounds-table';
import { DefaultVideosTable } from '@/components/features/setting/default-videos-table';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const dialog = useDialog();
const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const settingStore = useSettingStore();

const loadSettings = async (): Promise<void> => {
  try {
    await settingStore.fetchSettings();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const handleDeleteBackground = async (url: string): Promise<void> => {
  try {
    await settingStore.removeBannerDefaultBackground(url);
    showSuccessSnackbar('Background removed.');
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const openAddBackgroundDialog = async (): Promise<void> => {
  await dialog.showDialog({
    component: AddDefaultBackgroundDialog,
  });
};

const confirmDeleteBackground = async (url: string): Promise<void> => {
  const isConfirmed = await confirm({
    message: `Remove this default background?\n\n${url}`,
    confirmText: 'Delete',
    confirmColor: 'error',
  });

  if (!isConfirmed) {
    return;
  }

  await handleDeleteBackground(url);
};

onMounted(() => {
  void loadSettings();
});
</script>

<template>
  <page-container class="fill-height">
    <v-row>
      <v-col cols="12" md="6">
        <titled-section title="Default Banner Videos">
          <default-videos-table hide-default-footer />
          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn icon="mdi-plus" disabled></v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>
      <v-col cols="12" md="6">
        <titled-section title="Default Banner Backgrounds">
          <default-backgrounds-table hide-default-footer>
            <template #actions="{ url }">
              <v-btn
                color="error"
                icon="mdi-delete"
                size="small"
                variant="text"
                @click="void confirmDeleteBackground(url)"
              />
            </template>
          </default-backgrounds-table>
          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn icon="mdi-plus" @click="void openAddBackgroundDialog()"></v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
