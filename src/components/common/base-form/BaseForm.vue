<script setup lang="ts">
import type { VForm } from 'vuetify/components';
import { useTemplateRef } from 'vue';

const props = defineProps<{
  id: string;
}>();

const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const emit = defineEmits<{
  submit: [];
}>();

const form = useTemplateRef<VForm>('form');

const handleSubmit = (): void => {
  emit('submit');
};

/**
 * Validates every field and shows the messages of those that fail, also on fields the user never touched.
 * @returns Whether every field passes.
 */
const validate = async (): Promise<boolean> => {
  const result = await form.value?.validate();

  return result?.valid ?? true;
};

defineExpose({ validate });
</script>

<template>
  <v-form v-model="isValid" @submit.prevent="handleSubmit" :id="props.id" ref="form">
    <slot />
  </v-form>
</template>
