<script setup lang="ts">
import type { ChangePasswordFormRequest } from './changePasswordFormRequest';

import { BaseForm } from '@/components/common/base-form';

import { getRules } from './changePasswordFormRules';

const props = defineProps<{
  id: string;
}>();

const request = defineModel<ChangePasswordFormRequest>('request', {
  default: () => ({
    password: '',
    password_confirmation: '',
  }),
});

const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const rules = getRules(request.value.password);
</script>

<template>
  <base-form v-model:is-valid="isValid" :id="props.id">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="request.password"
          :rules="rules.password"
          class="required"
          label="New password"
          prepend-inner-icon="mdi-lock-outline"
          type="password"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="request.password_confirmation"
          :rules="rules.confirmPassword"
          class="required"
          label="Confirm new password"
          prepend-inner-icon="mdi-shield-lock-outline"
          type="password"
        />
      </v-col>
    </v-row>
  </base-form>
</template>
