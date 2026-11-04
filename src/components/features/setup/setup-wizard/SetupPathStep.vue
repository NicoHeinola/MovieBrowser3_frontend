<script setup lang="ts">
import type { SetupCheckResult } from '@/interfaces/api/models/SetupCheckResult';
import type { SetupChecks } from '@/interfaces/api/models/SetupChecks';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { useSetupStore } from '@/stores/setup/useSetupStore';

const props = defineProps<{
  /** The setting this step saves; the backend checks it under the same key. */
  settingKey: keyof SetupChecks;
  /** Id of the step's form, which the wizard's footer button submits. */
  formId: string;
  label: string;
  rules: ((value: string) => true | string)[];
  /** Paths offered as one-click chips under the field. */
  suggestions?: string[];
}>();

const path = defineModel<string>('path', { required: true });
/** Whether the path passes the field's rules, so the wizard's footer button can be enabled. */
const isValid = defineModel<boolean>('isValid', { default: false });
/** Whether the path is being checked and saved, so the wizard's footer button can show it. */
const isSubmitting = defineModel<boolean>('isSubmitting', { default: false });

const emit = defineEmits<{
  /** The path passed its check and is saved. */
  saved: [];
}>();

const checkResult = ref<SetupCheckResult | null>(null);

const settingStore = useSettingStore();
const setupStore = useSetupStore();
const { showAPIErrorSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const savedPath = computed<string>(() => settingStore.getSetting<string>(props.settingKey) ?? '');
const trimmedPath = computed<string>(() => path.value.trim());
const isChangingSavedPath = computed<boolean>(() => savedPath.value !== '' && trimmedPath.value !== savedPath.value);

/** Why the last check failed, or `null` while there is nothing to report. */
const checkFailedMessage = computed<string | null>(() =>
  checkResult.value?.ok === false ? t(`setup.checkCodes.${checkResult.value.code}`, checkResult.value.params) : null,
);

/**
 * Checks the path, saves it when it passes and moves on. Every submit checks again, so the admin can retry after
 * fixing what the check complained about outside the app, such as a stopped VLC bridge.
 * @returns Nothing.
 */
const submit = async (): Promise<void> => {
  // Enter still submits while the button shows as loading, and a second run would save the path twice.
  if (!isValid.value || isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  try {
    checkResult.value = await setupStore.checkAndSavePath(props.settingKey, trimmedPath.value);

    if (checkResult.value?.ok !== false) {
      emit('saved');
    }
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSubmitting.value = false;
  }
};

// An edited path hasn't been checked yet, so the old reason no longer applies.
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
      <base-form v-model:is-valid="isValid" @submit="submit" :id="props.formId">
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

      <!-- Notices stay below the field: they come and go while typing, and must not push the field around. -->
      <v-alert class="mt-4" type="error" v-if="checkFailedMessage">{{ checkFailedMessage }}</v-alert>
      <slot :saved-path="savedPath" name="changed" v-if="isChangingSavedPath" />
      <slot name="notices" />
    </v-col>
  </v-row>
</template>
