<script setup lang="ts">
import type { ShowSectionFormData } from './ShowSectionFormData';
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

import { onMounted, ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { CategoryAutocomplete } from '@/components/features/category-autocomplete';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showSectionService } from '@/services/show/showSectionService';
import { deepClone } from '@/utils/clone/deepClone';
import { getChangedObject } from '@/utils/object/hasObjectChanged';
import { getRules } from './showSectionEditDialogRules';

const props = defineProps<
  DialogComponentProps<boolean> & {
    /** Categories already used by other sections; the backend allows one section per category. */
    usedCategoryIds?: number[];
  }
>();

const showSection = defineModel<ShowSectionFormData>('showSection', { required: true });
const isDialogVisible = defineModel<boolean>({ required: true });

const originalShowSection = ref<ShowSectionFormData | null>(null);
const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const rules = getRules();

const saveShowSection = async (): Promise<void> => {
  if (!showSection.value.category_id) {
    return;
  }

  showSection.value.description ||= null;

  const request = {
    category_id: showSection.value.category_id,
    description: showSection.value.description,
    sort_order: showSection.value.sort_order,
  };

  if (showSection.value.id) {
    const hasChanges = getChangedObject(originalShowSection.value, showSection.value) !== undefined;

    if (!hasChanges) {
      return;
    }

    await showSectionService.update(showSection.value.id, request);
    return;
  }

  const createdShowSection = await showSectionService.create(request);
  showSection.value.id = createdShowSection.id;
};

const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    await saveShowSection();

    showSuccessSnackbar('Frontpage section saved successfully.');

    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

const deleteShowSection = async (): Promise<void> => {
  const confirmed = await confirm({
    message: 'Are you sure you want to remove this category from the frontpage?',
    confirmText: 'Delete',
    confirmColor: 'error',
    cancelText: 'Cancel',
  });

  if (!confirmed) {
    return;
  }

  isSaving.value = true;

  try {
    await showSectionService.remove(showSection.value.id);
    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  if (showSection.value?.id) {
    originalShowSection.value = deepClone<ShowSectionFormData>(showSection.value);
  }
});
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="600px">
    <template #title>
      {{ showSection?.id ? 'Edit Frontpage Section' : 'Create Frontpage Section' }}
    </template>

    <template #default>
      <base-form v-model:is-valid="isFormValid" @submit="handleSave" id="show-section-form">
        <v-row>
          <v-col cols="12">
            <category-autocomplete
              v-model="showSection.category_id"
              :disabled-ids="props.usedCategoryIds"
              :rules="rules.category_id"
              class="required"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="showSection.description" :rules="rules.description" label="Description" rows="2" />
          </v-col>
        </v-row>
      </base-form>
    </template>

    <template #actions>
      <v-btn
        :disabled="isSaving"
        color="error"
        prepend-icon="mdi-trash-can"
        variant="text"
        @click="deleteShowSection"
        v-if="showSection?.id"
      >
        Delete
      </v-btn>
      <v-spacer />
      <v-btn :disabled="isSaving" variant="text" @click="props.close()"> Cancel </v-btn>
      <v-btn
        :disabled="!isFormValid || isSaving"
        :loading="isSaving"
        color="primary"
        variant="flat"
        @click="handleSave"
      >
        Save
      </v-btn>
    </template>
  </base-dialog>
</template>
