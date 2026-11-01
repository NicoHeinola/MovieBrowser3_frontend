<script setup lang="ts">
import type { RegisterRequest } from './registerRequest';

import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';

import { getRules } from './registerFormRules';

const { t } = useI18n();

const props = defineProps<{
  id: string;
}>();

const request = defineModel<RegisterRequest>('request', {
  default: () => ({
    username: '',
    password: '',
    password_confirmation: '',
  }),
});
const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const rules = getRules(() => request.value.password);
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
      <v-col cols="12">
        <v-text-field
          v-model="request.password"
          :label="t('auth.password')"
          :rules="rules.password"
          autocomplete="new-password"
          class="required"
          prepend-inner-icon="mdi-lock-outline"
          type="password"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="request.password_confirmation"
          :label="t('auth.confirmPassword')"
          :rules="rules.confirmPassword"
          autocomplete="new-password"
          class="required"
          prepend-inner-icon="mdi-shield-lock-outline"
          type="password"
        />
      </v-col>
    </v-row>
  </base-form>
</template>
