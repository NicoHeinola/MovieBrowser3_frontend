<script setup lang="ts">
import type { AuthLoginRequest } from '@/interfaces/api/AuthLoginRequest';

import { loginPasswordRules, loginUsernameRules } from './loginFormRules';

const request = defineModel<AuthLoginRequest>('request', {
  default: () => ({
    username: '',
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
          v-model="request.username"
          :rules="loginUsernameRules"
          autocomplete="username"
          class="required"
          label="Username"
          prepend-inner-icon="mdi-account-outline"
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
