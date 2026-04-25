<script setup lang="ts">
import type { UsernameFormRequest } from './usernameFormRequest';

import { BaseForm } from '@/components/common/base-form';

import { getRules } from './usernameFormRules';

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
          :rules="rules.username"
          autocomplete="username"
          class="required"
          label="Username"
          prepend-inner-icon="mdi-account-outline"
        />
      </v-col>
    </v-row>
  </base-form>
</template>
