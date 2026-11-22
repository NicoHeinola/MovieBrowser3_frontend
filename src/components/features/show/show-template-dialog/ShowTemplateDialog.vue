<script setup lang="ts">
import type { ShowTemplateDialogProps } from './showTemplateDialogProps';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { useShowTemplate } from '@/composables/show/useShowTemplate';
import { getRules } from './showTemplateDialogRules';

const props = defineProps<ShowTemplateDialogProps>();

const isDialogVisible = defineModel<boolean>({ required: true });

const url = ref<string>(props.initialUrl ?? '');
const isFormValid = ref<boolean>(false);

const { isLoading, loadTemplate } = useShowTemplate();
const { t } = useI18n();
const rules = getRules();

/**
 * Loads the show behind the link and hands it to the editor. A failed load keeps the dialog open to fix the link.
 * @returns Nothing.
 */
const fill = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  const template = await loadTemplate(url.value);

  if (template) {
    props.close(template);
  }
};
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="560px">
    <template #title> {{ t('showEditor.template.dialogTitle') }} </template>

    <template #default>
      <base-form v-model:is-valid="isFormValid" @submit="fill" id="show-template-form">
        <v-text-field
          v-model="url"
          :hint="t('showEditor.template.linkHint')"
          :label="t('showEditor.template.linkLabel')"
          :rules="rules.url"
          class="required"
          prepend-inner-icon="mdi-link-variant"
          autofocus
          persistent-hint
        />
      </base-form>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn :disabled="isLoading" variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
      <v-btn
        :disabled="!isFormValid || isLoading"
        :loading="isLoading"
        color="primary"
        form="show-template-form"
        type="submit"
        variant="flat"
      >
        {{ t('showEditor.template.fill') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
