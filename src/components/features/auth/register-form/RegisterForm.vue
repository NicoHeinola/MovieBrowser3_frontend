<script setup lang="ts">
import type { RegisterRequest } from './registerRequest';

import { computed } from 'vue';

import { getRegisterConfirmPasswordRules, registerEmailRules, registerPasswordRules } from './registerFormRules';

const request = defineModel<RegisterRequest>('request', {
  default: () => ({
    email: '',
    password: '',
    confirmPassword: '',
  }),
});
const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const confirmPasswordRules = computed(() => getRegisterConfirmPasswordRules(request.value.password));
</script>

<template>
  <v-form v-model="isValid">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="request.email"
          :rules="registerEmailRules"
          autocomplete="email"
          class="required"
          label="Email"
          prepend-inner-icon="mdi-email-outline"
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
          v-model="request.confirmPassword"
          :rules="confirmPasswordRules"
          autocomplete="new-password"
          class="required"
          label="Confirm password"
          prepend-inner-icon="mdi-shield-lock-outline"
          type="password"
        />
      </v-col>
    </v-row>
  </v-form>
</template>
