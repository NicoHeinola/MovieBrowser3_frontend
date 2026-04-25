<script setup lang="ts">
import type { AuthLoginRequest } from '@/interfaces/api/requests/AuthLoginRequest';

import { BaseForm } from '@/components/common/base-form';

import { getRules } from './loginFormRules';

const props = defineProps<{
  id: string;
}>();

const request = defineModel<AuthLoginRequest>('request', {
  default: () => ({
    username: '',
    password: '',
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
          class="required"
          label="Password"
          prepend-inner-icon="mdi-lock-outline"
          type="password"
        />
      </v-col>
    </v-row>
  </base-form>
</template>
