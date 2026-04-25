<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

import { ref } from 'vue';

import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import { getRules } from './defaultBackgroundUrlRules';

const props = defineProps<DialogComponentProps>();

const url = ref<string>('');
const isValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const settingStore = useSettingStore();

const formId = 'add-default-background-form';

const rules = getRules();

const handleClose = (): void => {
  if (isSaving.value) {
    return;
  }

  props.close();
};

const handleSubmit = async (): Promise<void> => {
  if (!isValid.value || isSaving.value) {
    return;
  }

  isSaving.value = true;

  try {
    await settingStore.addBannerDefaultBackground(url.value);
    showSuccessSnackbar('Background added.');
    props.close();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <base-dialog :max-width="600" :model-value="props.modelValue">
    <template #title>
      <p>Add default background</p>
    </template>

    <div class="d-flex flex-column ga-4">
      <base-form v-model:is-valid="isValid" @submit="void handleSubmit()" :id="formId">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="url"
              :disabled="isSaving"
              :rules="rules.url"
              class="required"
              label="Background image URL"
              prepend-inner-icon="mdi-image-outline"
              clearable
            />
          </v-col>
        </v-row>
      </base-form>
    </div>

    <template #actions>
      <v-btn :disabled="isSaving" color="default" @click="handleClose"> Cancel </v-btn>
      <v-btn
        :disabled="!isValid || isSaving"
        :form="formId"
        :loading="isSaving"
        color="primary"
        type="submit"
        variant="tonal"
      >
        Add background
      </v-btn>
    </template>
  </base-dialog>
</template>
