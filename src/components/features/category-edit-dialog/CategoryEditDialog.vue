<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Category } from '@/interfaces/api/models/Category';

import { onMounted, ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import BaseForm from '@/components/common/base-form/BaseForm.vue';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog.ts';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { categoryService } from '@/services/show/categoryService.ts';
import { deepClone } from '@/utils/clone/deepClone.ts';

const props = defineProps<DialogComponentProps<boolean>>();

const category = defineModel<Category>('category', { required: true });
const originalCategory = ref<Category | null>(null);

const { confirm } = useConfirmDialog();

const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const isDialogVisible = defineModel<boolean>({ required: true });

const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();

const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    showSuccessSnackbar('Category saved successfully.');

    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

const deleteCategory = async (): Promise<void> => {
  const confirmed = await confirm({
    message: 'Are you sure you want to delete this category? This action cannot be undone.',
    confirmText: 'Delete',
    confirmColor: 'error',
    cancelText: 'Cancel',
  });

  if (!confirmed) {
    return;
  }

  isSaving.value = true;

  try {
    await categoryService.remove(category.value.id);
    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  // Clone the category to keep track of original values for comparison
  if (category.value?.id) {
    originalCategory.value = deepClone<Category>(category.value);
  }
});
</script>

<template>
  <base-dialog v-model="isDialogVisible">
    <template #title>
      {{ category?.id ? 'Edit Category' : 'Create Category' }}
    </template>

    <template #default>
      <base-form v-model="isFormValid" class="w-100 h-100 overflow-scroll" style="max-height: 60vh" id="category-form">
      </base-form>
    </template>

    <template #actions>
      <v-btn
        :disabled="isSaving"
        color="error"
        prepend-icon="mdi-trash-can"
        variant="text"
        @click="deleteCategory"
        v-if="category?.id"
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
