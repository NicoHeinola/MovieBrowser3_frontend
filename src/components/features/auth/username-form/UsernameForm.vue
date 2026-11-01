<script setup lang="ts">
import type { UsernameFormRequest } from './usernameFormRequest';

import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';

import { getRules } from './usernameFormRules';

const { t } = useI18n();

const props = defineProps<{
  id: string;
}>();

const request = defineModel<UsernameFormRequest>('request', {
  default: () => ({
    username: '',
  }),
});

const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const rules = getRules();
</script>

<template>
  <base-form v-model:is-valid="isValid" :id="props.id">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="request.username"
          :label="t('auth.username')"
          :rules="rules.username"
          autocomplete="username"
          class="required"
          prepend-inner-icon="mdi-account-outline"
        />
      </v-col>
    </v-row>
  </base-form>
</template>
