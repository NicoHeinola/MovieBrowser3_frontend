<script setup lang="ts">
import type { SetupCheckResult } from '@/interfaces/api/models/SetupCheckResult';
import type { SetupChecks } from '@/interfaces/api/models/SetupChecks';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { setupService } from '@/services/setup/setupService';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const props = defineProps<{
  /** The setting this step saves; the backend checks it under the same key. */
  settingKey: keyof SetupChecks;
  label: string;
  rules: ((value: string) => true | string)[];
  /** Paths offered as one-click chips under the field. */
  suggestions?: string[];
}>();

const path = defineModel<string>('path', { required: true });

const emit = defineEmits<{
  back: [];
  next: [];
}>();

const formId = `setup-${props.settingKey}-form`;

const isValid = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const checkResult = ref<SetupCheckResult | null>(null);

const settingStore = useSettingStore();
const { showAPIErrorSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const savedPath = computed<string>(() => settingStore.getSetting<string>(props.settingKey) ?? '');
const trimmedPath = computed<string>(() => path.value.trim());
const hasFailedCheck = computed<boolean>(() => checkResult.value?.ok === false);
const isChangingSavedPath = computed<boolean>(() => savedPath.value !== '' && trimmedPath.value !== savedPath.value);

/**
 * Saves the path when it changed and moves on to the next step.
 * @returns Nothing.
 */
const save = async (): Promise<void> => {
  if (trimmedPath.value !== savedPath.value) {
    await settingStore.updateSetting(props.settingKey, trimmedPath.value);
  }

  emit('next');
};

/**
 * Checks the path, then saves it. A failed check shows its reason instead, and the button then offers to save anyway,
 * because the backend can't see every setup (VLC outside the usual folders, a drive mounted later).
 * @returns Nothing.
 */
const submit = async (): Promise<void> => {
  if (!isValid.value) {
    return;
  }

  isSubmitting.value = true;
  try {
    if (!hasFailedCheck.value) {
      const checks = await setupService.check({ [props.settingKey]: trimmedPath.value });

      checkResult.value = checks[props.settingKey] ?? null;

      if (hasFailedCheck.value) {
        return;
      }
    }

    await save();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSubmitting.value = false;
  }
};

// An edited path hasn't been checked yet, so drop the old result and the "save anyway" offer with it.
watch(path, () => {
  checkResult.value = null;
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <slot />
    </v-col>

    <v-col cols="12">
      <base-form v-model:is-valid="isValid" @submit="submit" :id="formId">
        <v-text-field
          v-model="path"
          :label="props.label"
          :rules="props.rules"
          prepend-inner-icon="mdi-folder-outline"
        />
      </base-form>

      <div class="d-flex flex-wrap ga-2 mt-4" v-if="props.suggestions?.length">
        <v-chip
          v-for="suggestion in props.suggestions"
          :color="suggestion === trimmedPath ? 'link' : undefined"
          prepend-icon="mdi-lightbulb-outline"
          @click="path = suggestion"
          :key="suggestion"
        >
          {{ suggestion }}
        </v-chip>
      </div>
    </v-col>

    <v-col cols="12" v-if="isChangingSavedPath && $slots.changed">
      <slot :saved-path="savedPath" name="changed" />
    </v-col>

    <v-col cols="12" v-if="hasFailedCheck">
      <v-alert type="warning">
        {{ checkResult?.message ?? t('setup.checkFailed') }}
        <div class="mt-2">{{ t('setup.checkFailedHint') }}</div>
      </v-alert>
    </v-col>

    <v-col class="d-flex ga-2 justify-end" cols="12">
      <v-btn variant="text" @click="emit('back')">{{ t('setup.back') }}</v-btn>
      <v-btn
        :color="hasFailedCheck ? 'warning' : 'primary'"
        :disabled="!isValid"
        :form="formId"
        :loading="isSubmitting"
        type="submit"
      >
        {{ hasFailedCheck ? t('setup.saveAnyway') : t('setup.next') }}
      </v-btn>
    </v-col>
  </v-row>
</template>
