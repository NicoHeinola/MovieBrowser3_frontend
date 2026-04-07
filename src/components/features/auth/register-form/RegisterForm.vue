<script setup lang="ts">
import type { RegisterRequest } from './registerRequest';

import { computed } from 'vue';

import { BaseForm } from '@/components/common/base-form';

import { getRegisterConfirmPasswordRules, registerPasswordRules, registerUsernameRules } from './registerFormRules';

const request = defineModel<RegisterRequest>('request', {
  default: () => ({
    username: '',
    password: '',
    password_confirmed: '',
  }),
});
const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const confirmPasswordRules = computed(() => getRegisterConfirmPasswordRules(request.value.password));
</script>

<template>
  <base-form v-model:is-valid="isValid">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="request.username"
          :rules="registerUsernameRules"
          autocomplete="username"
          class="required"
          label="Username"
          prepend-inner-icon="mdi-account-outline"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="request.password"
          :rules="registerPasswordRules"
          autocomplete="new-password"
          class="required"
          label="Password"
          prepend-inner-icon="mdi-lock-outline"
          type="password"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="request.password_confirmed"
          :rules="confirmPasswordRules"
          autocomplete="new-password"
          class="required"
          label="Confirm password"
          prepend-inner-icon="mdi-shield-lock-outline"
          type="password"
        />
      </v-col>
    </v-row>
  </base-form>
</template>
