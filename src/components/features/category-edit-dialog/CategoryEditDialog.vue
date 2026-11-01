<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Category } from '@/interfaces/api/models/Category';

import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { MdiIconAutocomplete } from '@/components/common/mdi-icon-autocomplete';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { categoryService } from '@/services/show/categoryService';
import { deepClone } from '@/utils/clone/deepClone';
import { getChangedObject } from '@/utils/object/hasObjectChanged';
import { getRules } from './categoryEditDialogRules';

const props = defineProps<DialogComponentProps<boolean>>();

const category = defineModel<Category>('category', { required: true });
const originalCategory = ref<Category | null>(null);

const { confirm } = useConfirmDialog();

const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const isDialogVisible = defineModel<boolean>({ required: true });

const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const { t } = useI18n();
const rules = getRules();

const saveCategory = async (): Promise<void> => {
  const request = {
    name: category.value.name,
    value: category.value.value,
    icon: category.value.icon,
  };

  if (category.value.id) {
    const hasChanges = getChangedObject(originalCategory.value, category.value) !== undefined;

    if (!hasChanges) {
      return;
    }

    await categoryService.update(category.value.id, request);
    return;
  }

  const createdCategory = await categoryService.create(request);
  category.value.id = createdCategory.id;
};

const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    await saveCategory();

    showSuccessSnackbar(t('category.saved'));

    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

const deleteCategory = async (): Promise<void> => {
  const confirmed = await confirm({
    message: t('category.deleteConfirm'),
    confirmText: t('common.delete'),
    confirmColor: 'error',
    cancelText: t('common.cancel'),
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
  if (category.value?.id) {
    originalCategory.value = deepClone<Category>(category.value);
  }
});
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="600px">
    <template #title>
      {{ category?.id ? 'Edit Category' : 'Create Category' }}
    </template>

    <template #default>
      <base-form v-model:is-valid="isFormValid" @submit="handleSave" id="category-form">
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="category.name" :label="t('category.name')" :rules="rules.name" class="required" />
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="category.value" :label="t('category.value')" :rules="rules.value" class="required">
              <template #prepend>
                <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('category.valueHint')" />
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12">
            <mdi-icon-autocomplete v-model="category.icon" :rules="rules.icon" />
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
        @click="deleteCategory"
        v-if="category?.id"
      >
        {{ t('common.delete') }}
      </v-btn>
      <v-spacer />
      <v-btn :disabled="isSaving" variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
      <v-btn
        :disabled="!isFormValid || isSaving"
        :loading="isSaving"
        color="primary"
        variant="flat"
        @click="handleSave"
      >
        {{ t('common.save') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
