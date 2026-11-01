<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { AppLocale } from '@/enums/locale/AppLocale';

import { useI18n } from 'vue-i18n';
import { BaseDialog } from '@/components/common/base-dialog';
import { HeadingText } from '@/components/common/heading-text';
import { useLocale } from '@/composables/locale/useLocale';
import { languageOptions } from '@/data/locale/languageOptions';

const props = defineProps<DialogComponentProps>();

const { t } = useI18n();
const { locale, setLocale } = useLocale();

/**
 * Applies the picked language and closes the dialog.
 * @param newLocale - The language the user picked.
 * @returns Nothing.
 */
const pickLocale = (newLocale: AppLocale): void => {
  setLocale(newLocale);
  props.close();
};
</script>

<template>
  <base-dialog :model-value="props.modelValue" max-width="480">
    <div class="d-flex flex-column ga-5">
      <div class="d-flex align-center ga-4">
        <v-avatar color="primary" rounded="lg" size="large" variant="tonal">
          <v-icon>mdi-translate</v-icon>
        </v-avatar>
        <heading-text :level="2" :subtitle="t('locale.dialogSubtitle')" :title="t('locale.dialogTitle')" />
      </div>

      <div class="d-flex flex-column ga-2">
        <!-- The browser-detected language is highlighted as the suggested pick. -->
        <v-btn
          v-for="option in languageOptions"
          :color="option.locale === locale ? 'primary' : undefined"
          :variant="option.locale === locale ? 'flat' : 'tonal'"
          block
          @click="pickLocale(option.locale)"
          :key="option.locale"
        >
          {{ option.name }}
        </v-btn>
      </div>
    </div>
  </base-dialog>
</template>
