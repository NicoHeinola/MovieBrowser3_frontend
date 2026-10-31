<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

import { ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { websiteTagService } from '@/services/website/websiteTagService';
import { getRules } from './websiteTagCreateDialogRules';

const props = defineProps<DialogComponentProps<boolean>>();

const isDialogVisible = defineModel<boolean>({ required: true });

const name = ref<string>('');
const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const rules = getRules();

const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    const createdTag = await websiteTagService.create({ name: name.value.trim() });

    showSuccessSnackbar(`Tag “${createdTag.name}” added.`);

    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="420px">
    <template #title> Add Tag </template>

    <template #default>
      <base-form v-model:is-valid="isFormValid" @submit="handleSave" id="website-tag-form">
        <v-text-field
          v-model="name"
          :rules="rules.name"
          class="required"
          label="Name"
          prepend-inner-icon="mdi-tag-outline"
          autofocus
        />
      </base-form>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn :disabled="isSaving" variant="text" @click="props.close()"> Cancel </v-btn>
      <v-btn
        :disabled="!isFormValid || isSaving"
        :loading="isSaving"
        color="primary"
        form="website-tag-form"
        type="submit"
        variant="flat"
      >
        Save
      </v-btn>
    </template>
  </base-dialog>
</template>
