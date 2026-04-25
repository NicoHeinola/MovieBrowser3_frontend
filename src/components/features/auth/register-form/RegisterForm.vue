<script setup lang="ts">
import type { RegisterRequest } from './registerRequest';

import { BaseForm } from '@/components/common/base-form';

import { getRules } from './registerFormRules';

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

const rules = getRules(request.value.password);
</script>

<template>
  <base-form v-model:is-valid="isValid" :id="props.id">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="request.username"
          :rules="rules.username"
          autocomplete="username"
          class="required"
          label="Username"
          prepend-inner-icon="mdi-account-outline"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="request.password"
          :rules="rules.password"
          autocomplete="new-password"
          class="required"
          label="Password"
          prepend-inner-icon="mdi-lock-outline"
          type="password"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="request.password_confirmation"
          :rules="rules.confirmPassword"
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
