<script setup lang="ts">
import type { LoginRequest } from './loginRequest';

import { loginEmailRules, loginPasswordRules } from './loginFormRules';

const request = defineModel<LoginRequest>('request', {
  default: () => ({
    email: '',
    password: '',
  }),
});
const isValid = defineModel<boolean>('isValid', {
  default: false,
});
</script>

<template>
  <v-form v-model="isValid">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="request.email"
          :rules="loginEmailRules"
          class="required"
          label="Email"
          prepend-inner-icon="mdi-email-outline"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="request.password"
          :rules="loginPasswordRules"
          class="required"
          label="Password"
          prepend-inner-icon="mdi-lock-outline"
          type="password"
        />
      </v-col>
    </v-row>
  </v-form>
</template>
