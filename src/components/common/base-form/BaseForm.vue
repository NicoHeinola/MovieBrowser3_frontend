<script setup lang="ts">
const props = defineProps<{
  id: string;
}>();

const isValid = defineModel<boolean>('isValid', {
  default: false,
});

const emit = defineEmits<{
  submit: [];
}>();

const handleSubmit = (): void => {
  emit('submit');
};
</script>

<template>
  <v-form v-model="isValid" @submit.prevent="handleSubmit" :id="props.id">
    <slot />
  </v-form>
</template>
