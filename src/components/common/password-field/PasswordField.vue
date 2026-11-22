<script setup lang="ts">
import type { VTextField } from 'vuetify/components';

import { ref, useTemplateRef } from 'vue';

/** The password text. Other `v-text-field` props and events pass through to the field. */
const password = defineModel<string | null>();

/** Whether the password is shown as plain text instead of dots. */
const isVisible = ref<boolean>(false);

const field = useTemplateRef<VTextField>('field');

/**
 * Validates the field, like `v-text-field`'s own `validate`.
 * @param silent Whether to skip showing the error messages.
 * @returns The error messages, empty when the field passes.
 */
const validate = async (silent?: boolean): Promise<string[]> => {
  return (await field.value?.validate(silent)) ?? [];
};

defineExpose({ validate });
</script>

<template>
  <v-text-field
    v-model="password"
    :append-inner-icon="isVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
    :type="isVisible ? 'text' : 'password'"
    @click:append-inner="isVisible = !isVisible"
    ref="field"
  />
</template>
